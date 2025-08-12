// This file handles Naukri.com scraping with similar approach to the original
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapperThreadService } from '../thread.service';
import { fetchWithRetry, getCommonHeaders } from '../utils/http-utils';

@Injectable()
export class NaukriService {
  constructor(private readonly threadService: ScrapperThreadService) {
    // Add stealth plugin to puppeteer - create a new instance
    puppeteer.use(StealthPlugin());
  }
  /**
   * Main function to be called from controllers
   * @param queryoptions Options for searching jobs
   * @returns Scraped job data with pagination
   */ async getJobs(queryoptions: any): Promise<any> {
    // Add pagination parameters with defaults if not provided
    const page = queryoptions.page ? parseInt(queryoptions.page) : 1;
    const size = queryoptions.size ? parseInt(queryoptions.size) : 10;

    // Check if this is coming from the combined service
    const isCombinedRequest = queryoptions.hasOwnProperty('useThreads');

    // If this is a test request, don't waste time processing details
    const isTestRequest = queryoptions._isTestRequest === true;

    // Add page number to URL if needed
    if (page > 1 && !queryoptions.url) {
      queryoptions.page = page;
    }

    const url = this.url_generate(queryoptions);

    console.log('Generated URL:', url);
    if (!url) {
      console.log('No valid URL generated');
      return { success: false, message: 'No valid URL generated', data: [] };
    }

    try {
      // Get job links - TIME OPTIMIZATION: Split into chunks and process in parallel
      console.time('get-links');
      const links = await this.getLinks(url);
      console.timeEnd('get-links');
      console.log(`Found ${links.length} job links`);

      if (links.length === 0) {
        return {
          success: false,
          message: 'No job links found',
          data: [],
        };
      }

      // For test requests, just return the count but ensure it's accurate
      if (isTestRequest) {
        console.log(`Test request: Found ${links.length} total jobs`);
        return {
          success: true,
          message: 'Test request completed',
          data: links.slice(0, 1).map(link => ({
            title: 'Test job from Naukri',
            link,
          })),
          total: links.length,
        };
      }

      // Calculate pagination
      const total = links.length;
      const startIndex = (page - 1) * size;
      const endIndex = Math.min(startIndex + size, total);

      // Get links for the current page
      const paginatedLinks = links.slice(startIndex, endIndex);
      console.log(
        `Processing ${paginatedLinks.length} job listings for page ${page}...`,
      );

      // Process jobs for the current page - similar to original code but with promises
      let allJobDetails: any[] = []; // Use direct Promise.all with race conditions to handle timeouts
      console.time('job-details-processing');
      console.log(
        `Processing all ${paginatedLinks.length} jobs in parallel with timeout protection`,
      );

      // Maximum time to wait for any single job (in milliseconds)
      const JOB_TIMEOUT = 15000; // 15 seconds max per job

      const jobPromises = paginatedLinks.map((link, index) => {
        return new Promise(async resolve => {
          // Create a timeout promise that will resolve after JOB_TIMEOUT milliseconds
          const timeoutPromise = new Promise(timeoutResolve => {
            setTimeout(() => {
              console.warn(
                `Job ${index + 1} (${link}) timed out after ${JOB_TIMEOUT / 1000}s`,
              );
              timeoutResolve(this.getFallbackJob(link, true));
            }, JOB_TIMEOUT);
          });

          try {
            // Race between the actual job extraction and the timeout
            const jobDetails = await Promise.race([
              this.getJobDetails(link).catch(e => {
                console.error(`Error in job ${index + 1}:`, e.message);
                return this.getFallbackJob(link);
              }),
              timeoutPromise,
            ]);

            if (jobDetails) {
              if (jobDetails.timedOut) {
                console.log(`Using fallback for timed out job: ${link}`);
              } else {
                console.log(
                  `Successfully extracted details for: ${jobDetails.title}`,
                );
              }
              resolve(jobDetails);
            } else {
              console.log(`Failed to get details for: ${link}`);
              resolve(this.getFallbackJob(link));
            }
          } catch (error: any) {
            console.error(`Error processing job ${link}:`, error.message);
            resolve(this.getFallbackJob(link));
          }
        });
      });

      // Wait for all jobs to complete in parallel (with timeout protection)
      allJobDetails = await Promise.all(jobPromises);
      console.timeEnd('job-details-processing');

      // Filter out null results and ensure we have valid jobs
      allJobDetails = allJobDetails.filter(job => job !== null);
      console.log(
        `Successfully processed ${allJobDetails.length} job details from ${paginatedLinks.length} links`,
      );

      // Save to JSON if saveToFile option is provided
      if (queryoptions.saveToFile) {
        const filename = `naukri_${queryoptions.search || 'jobs'}_${new Date().toISOString().slice(0, 10)}.json`;
        this.saveToJson(allJobDetails, filename);
        console.log(`Saved ${allJobDetails.length} job details to ${filename}`);
      }

      // Calculate total pages
      const totalPages = Math.ceil(total / size);

      return {
        success: true,
        message: `Successfully scraped ${allJobDetails.length} jobs for page ${page}`,
        data: allJobDetails,
        page,
        size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error: any) {
      console.error('Error during scraping:', error.message);
      return {
        success: false,
        message: `Error during scraping: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * This method is kept for backward compatibility
   * It's recommended to use getJobs() instead
   */
  async query_result(queryoptions: any): Promise<any> {
    const result = await this.getJobs(queryoptions);
    if (result.success) {
      return result.data;
    }
    return [];
  }

  // Utility method to save results to JSON if needed
  async saveToJson(data: any, filename: string): Promise<void> {
    try {
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Data saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving to JSON:', error);
    }
  }
  // Creates a fallback job object when details can't be extracted
  private getFallbackJob(url: string, timedOut: boolean = false): any {
    return {
      title: timedOut ? 'Timed Out Job' : 'Job posting on Naukri',
      link: url,
      companyName: 'Company on Naukri',
      location: 'Location unavailable',
      experience: 'Experience details unavailable',
      skills: ['Skills unavailable due to extraction error'],
      jobDescription: timedOut
        ? 'Could not extract job details because the request timed out. This may be due to slow network or website response issues.'
        : 'Could not extract job details. The job posting site may have changed its layout or implemented anti-scraping measures.',
      aboutCompany: 'Company information unavailable',
      timestamp: new Date().toISOString(),
      timedOut: timedOut, // Flag to indicate if this was a timeout
    };
  }

  private url_generate(queryoptions: any): string {
    console.log(queryoptions.jobs);
    var pre_url = 'https://www.naukri.com/';
    let url = '';

    if (queryoptions.search) {
      const words = queryoptions.search.split(' ');
      const newwords = words.join('-');
      const nextwords = words.map((word: string) => word).join('%20');
      url = pre_url + newwords + '-jobs' + '?k=' + nextwords;

      // Add page number for pagination if specified
      if (queryoptions.page && queryoptions.page > 1) {
        url = url.replace('-jobs', `-jobs-${queryoptions.page}`);
      }
    }

    if (queryoptions.work_from_home) {
      url += '&wfhType=' + 2;
    }

    if (queryoptions.work_from_office) {
      url += '&wfhType=' + 0;
    }

    if (queryoptions.hybrid) {
      url += '&wfhType=' + 3;
    }

    if (queryoptions.jobAge) {
      url += '&jobAge=' + queryoptions.jobAge;
    }

    return url;
  }
  private async getLinks(url: string): Promise<string[]> {
    console.log(`Getting job links from: ${url}`);

    // Try with Axios first (much faster)
    try {
      const axiosLinks = await this.getLinksWithAxios(url);
      if (axiosLinks && axiosLinks.length > 0) {
        console.log(
          `Successfully fetched ${axiosLinks.length} job links with Axios`,
        );
        return axiosLinks;
      }

      console.log(
        'Axios approach failed or returned no results, falling back to Puppeteer...',
      );
    } catch (error) {
      console.error('Error with Axios approach for links:', error);
    }

    // Fallback to Puppeteer if Axios fails
    console.log('Falling back to Puppeteer for getting links...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    );
    try {
      console.log(`Navigating to URL with Puppeteer: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for job titles to appear - try multiple selectors
      await Promise.race([
        page.waitForSelector('.jobTuple', { timeout: 15000 }),
        page.waitForSelector('.title a', { timeout: 15000 }),
        page.waitForSelector('.job-card', { timeout: 15000 }),
      ]).catch(() => console.log('Could not find job listing elements'));
      // Try to scroll a bit to load more content
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });

      // Wait a bit for potential AJAX content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Directly extract links using the correct Naukri selectors
      const links = await page.evaluate(() => {
        // Try multiple selector patterns that might exist on Naukri
        const selectors = [
          '.jobTuple .title a', // Main selector
          '.job-card .title a', // Alternative selector
          'article .title a', // Another possibility
          '.job-container a.title', // Yet another variation
        ];

        // Try each selector
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            return Array.from(elements).map(
              el => el.getAttribute('href') || '',
            );
          }
        }

        // Fallback to any anchor with title class
        return Array.from(document.querySelectorAll('a.title')).map(
          el => el.getAttribute('href') || '',
        );
      });

      await browser.close();
      return links.filter(link => link !== '');
    } catch (err: any) {
      console.error('Error scraping job links with Puppeteer:', err.message);
      await browser.close();
      return [];
    }
  }
  private async getLinksWithAxios(url: string): Promise<string[]> {
    try {
      console.log(`Getting job links with Axios from: ${url}`);
      console.time('axios-get-links');

      // Use the http-utils for better headers and retry logic
      const response = await fetchWithRetry(
        url,
        {
          headers: getCommonHeaders('https://www.naukri.com/'),
          timeout: 15000,
        },
        2,
      );

      const $ = cheerio.load(response.data);

      const links: string[] = [];

      // Use selectors based on the HTML structure from Naukri
      const selectors = [
        '.srp-jobtuple-wrapper h2 a.title', // Main selector from actual HTML
        '.cust-job-tuple h2 a.title', // Alternative pattern
        '.styles_jlc__main__VdwtF h2 a', // Another pattern
        'h2 a.title', // Simplified selector
        '.jobTuple .title a', // Original selector
        '.job-card .title a', // Original selector
        'a.title', // Fallback
      ];

      for (const selector of selectors) {
        $(selector).each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            links.push(href);
          }
        });

        if (links.length > 0) {
          console.log(`Found ${links.length} links with selector: ${selector}`);
          break;
        }
      }

      // If no links found with specific selectors, try a more generic approach
      if (links.length === 0) {
        console.log(
          'No links found with specific selectors, trying generic approach',
        );
        $('a').each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('job-listings')) {
            links.push(href);
          }
        });
      }

      console.timeEnd('axios-get-links');
      console.log(`Found ${links.length} job links with Axios`);

      return links.filter(link => link !== '');
    } catch (error) {
      console.error('Error getting job links with Axios:', error);
      return [];
    }
  }
  private async getJobDetails(url: string): Promise<any> {
    try {
      const axiosDetails = await this.getJobDetailsWithAxios(url);
      if (
        axiosDetails &&
        axiosDetails.title &&
        axiosDetails.title !== 'Not available'
      ) {
        console.log(
          `Successfully fetched details for job with Axios: ${axiosDetails.title}`,
        );
        return axiosDetails;
      }

      console.log(
        'Axios approach failed or returned incomplete results, falling back to Puppeteer...',
      );
    } catch (error) {
      console.error('Error with Axios approach for job details:', error);
    }

    console.log(`Falling back to Puppeteer for job details: ${url}`);
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    );

    try {
      console.log(`Fetching job details from: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Use the same selector approach as the original code
      try {
        // Wait for critical elements to load
        // Try multiple selectors with Promise.race
        await Promise.race([
          // Title selectors
          page.waitForSelector('.jd-header-title', { timeout: 10000 }),
          page.waitForSelector('h1.title', { timeout: 10000 }),
          page.waitForSelector('h1', { timeout: 10000 }),

          // Job description selectors
          page.waitForSelector('.dang-inner-html', { timeout: 10000 }),
          page.waitForSelector('.job-desc', { timeout: 10000 }),

          // Company info selectors
          page.waitForSelector('.about-company', { timeout: 10000 }),
          page.waitForSelector('.company-info', { timeout: 10000 }),
        ]).catch(() =>
          console.log(
            'Could not find primary job detail selectors, continuing anyway',
          ),
        );
      } catch (error) {
        console.log('Could not find standard selectors, trying fallbacks');

        // Try to wait for any content that might have the job info
        await Promise.race([
          page.waitForSelector('main', { timeout: 5000 }),
          page.waitForSelector('article', { timeout: 5000 }),
          page.waitForSelector('.job-details', { timeout: 5000 }),
        ]).catch(() => console.log('No fallback selectors found either'));
      } // Extract job details using page.evaluate like in the original code
      const jobDetails = await page.evaluate((jobUrl: string) => {
        // Helper function to find text with multiple selectors
        const getText = (selectors: string[]) => {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
              return element.textContent.trim();
            }
          }
          return 'Not available';
        };

        // Job title - try multiple selectors
        const title = getText([
          '.jd-header-title',
          'h1.jd-header-title',
          'h1.title',
          'h1',
        ]);

        // Company name - try multiple selectors
        const companyName = getText([
          '.jd-header-comp-name a',
          '.company-name a',
          '.company a',
        ]);

        // Location - try multiple selectors
        const location = getText([
          '.location a',
          '.loc a',
          '.jd-location a',
          '[data-type="location"] span',
        ]);

        // Experience required - try multiple selectors
        const experience = getText([
          '.exp span',
          '.experience span',
          '[data-type="experience"] span',
        ]);

        // Salary - try multiple selectors
        const salary = getText(['.salary span', '[data-type="salary"] span']);

        // Work mode (WFH/Hybrid/Office) - try multiple selectors
        const workMode = getText([
          '.remote-role span',
          '.wfhmode span',
          '[data-type="workmode"] span',
        ]);

        // Job description - try multiple selectors
        const jobDescription = getText([
          '.dang-inner-html',
          '.job-desc',
          '.job-description',
        ]);

        // Skills - try multiple selectors for containers
        let skills: string[] = [];
        const skillSelectors = [
          '.key-skill .chip span',
          '.skill-tags .tag-item',
          '.tags .tag',
        ];

        for (const selector of skillSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            skills = Array.from(elements)
              .map(el => (el.textContent ? el.textContent.trim() : ''))
              .filter(text => text !== '');
            if (skills.length > 0) break;
          }
        }

        // About company - try multiple selectors
        let aboutCompany = getText([
          '.about-company .detail',
          '.about-company-info',
          '.company-desc',
        ]);

        if (aboutCompany === 'Not available') {
          // Fallback to creating basic info if about section not found
          const industry = getText([
            '.company-info .info:nth-child(2) span',
            '.industry span',
          ]);
          aboutCompany = `${companyName} is a company in the ${industry} industry.`;
        }

        // Company address - try multiple selectors
        const companyAddress = getText([
          '.comp-info-detail span',
          '.address span',
        ]);

        // Education requirements - try multiple selectors
        const education = getText([
          '.education .details span',
          '.education span',
        ]);

        return {
          title,
          link: jobUrl, // Use the URL passed to the evaluate function
          companyName,
          location,
          experience,
          salary,
          workMode,
          earlyApplicant: false,
          skills,
          jobDescription,
          aboutCompany,
          companyAddress,
          education,
          timestamp: new Date().toISOString(),
        };
      }, url); // Pass URL as parameter to page.evaluate

      await browser.close();
      return jobDetails;
    } catch (error: any) {
      console.error('Error scraping job details:', error.message);
      await browser.close();
      return null;
    }
  }
  private async getJobDetailsWithAxios(url: string): Promise<any> {
    try {
      console.log(`Fetching job details with Axios from: ${url}`);
      // Create a unique timer ID to avoid conflicts
      const timerId = `axios-job-details-${Math.random().toString(36).substring(2, 9)}`;
      console.time(timerId);

      // Use the http-utils for better headers and retry logic
      const response = await fetchWithRetry(
        url,
        {
          headers: getCommonHeaders('https://www.naukri.com/'),
          timeout: 15000,
        },
        3,
      ); // Try up to 3 retries

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);
      console.timeEnd(timerId);

      // Helper function to extract text with multiple possible selectors
      const getText = (selectors: string[]): string => {
        for (const selector of selectors) {
          const element = $(selector);
          if (element.length && element.text().trim()) {
            return element.text().trim();
          }
        }
        return 'Not available';
      };

      // Using selectors from both the Puppeteer implementation and the actual HTML

      // Job title - Using both puppeteer selectors and new style selectors
      const title = getText([
        '.styles_jd-header-title__rZwM1', // New style selector
        'h1.styles_jd-header-title__rZwM1', // New style selector variant
        'h1.jd-header-title', // Original selector
        '.jd-header-title', // Original selector
        'h1.title', // Fallback
        'h1', // Last resort
      ]);

      // Company name - Using both puppeteer selectors and new style selectors
      const companyName = getText([
        '.styles_jd-header-comp-name__MvqAI a', // New style selector
        '.jd-header-comp-name a', // Original selector
        '.company-name a', // Original selector
        '.company a', // Fallback
      ]);

      // Location - Using both puppeteer selectors and new style selectors
      const location = getText([
        '.styles_jhc__location__W_pVs a', // New style selector
        '.styles_jhc__loc___Du2H span', // New style selector variant
        '.location a', // Original selector
        '.loc a', // Original selector
        '.jd-location a', // Original selector
        '[data-type="location"] span', // Fallback
      ]);

      // Experience required - Using both puppeteer selectors and new style selectors
      const experience = getText([
        '.styles_jhc__exp__k_giM span', // New style selector
        '.exp span', // Original selector
        '.experience span', // Original selector
        '[data-type="experience"] span', // Fallback
      ]);

      // Salary - Using both puppeteer selectors and new style selectors
      const salary = getText([
        '.styles_jhc__salary__jdfEC span', // New style selector
        '.salary span', // Original selector
        '[data-type="salary"] span', // Fallback
      ]);

      // Work mode (WFH/Hybrid/Office) - Using both puppeteer selectors
      const workMode = getText([
        '.remote-role span', // Original selector
        '.wfhmode span', // Original selector
        '[data-type="workmode"] span', // Fallback
      ]);

      // Job description - Using both puppeteer selectors and new style selectors
      const rawJobDescription = getText([
        '.styles_JDC__dang-inner-html__h0K4t', // New style selector
        '.styles_dang-inner-html__h0K4t', // New style selector variant
        '.dang-inner-html', // Original selector
        '.job-desc', // Original selector
        '.job-description', // Fallback
      ]);

      // Format the job description for better readability
      const jobDescription = this.cleanJobDescription(rawJobDescription);

      // Skills - Using both puppeteer selectors and new style selectors
      const skills: string[] = [];

      // Try multiple skill selectors
      const skillSelectors = [
        '.styles_chip__7YCfG', // New style selector
        '.styles_key-skill__GIPn_ a', // New style selector
        '.key-skill .chip span', // Original selector
        '.skill-tags .tag-item', // Original selector
        '.tags .tag', // Original selector
        '.tags-gt .tag-li', // Additional selector
      ];

      // Try each selector until we find skills
      for (const selector of skillSelectors) {
        $(selector).each((_, element) => {
          const skillText = $(element).text().trim();
          if (skillText) {
            skills.push(skillText);
          }
        });

        if (skills.length > 0) break;
      }

      // About company - Using both puppeteer selectors and new style selectors
      const aboutCompany = getText([
        '.styles_detail__U2rw4', // New style selector
        '.about-company .detail', // Original selector
        '.about-company-info', // Original selector
        '.company-desc', // Fallback
      ]);

      // Education requirements - Using both puppeteer selectors and new style selectors
      const education = getText([
        '.styles_education__KXFkO .styles_details__Y424J span', // New style selector
        '.education .details span', // Original selector
        '.education span', // Fallback
      ]);

      // Posted date
      const postedDate = getText([
        '.styles_jhc__stat__PgY67 span:contains("Posted:")', // New style selector
        '.job-post-day', // Fallback
      ]);

      return {
        title,
        link: url,
        companyName,
        location,
        experience,
        salary,
        workMode,
        earlyApplicant: false,
        skills: skills.length > 0 ? skills : ['Not specified'],
        jobDescription,
        aboutCompany:
          aboutCompany !== 'Not available'
            ? aboutCompany
            : `Company: ${companyName}`,
        education,
        postedDate,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error scraping job details with Axios:', error);
      throw error; // Re-throw to trigger Puppeteer fallback
    }
  }

  // Helper function to clean and format job descriptions
  private cleanJobDescription(text: string): string {
    if (!text || text === 'Not available') {
      return 'Not available';
    }

    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();

    // Try to identify and format sections if they exist
    const sections = [
      'Responsibilities',
      'Requirements',
      'Qualifications',
      'Skills',
      'Experience',
      'Education',
      'Benefits',
      'About the Company',
    ];

    // Look for sections and add formatting
    for (const section of sections) {
      // Look for variations of section headers
      const regex = new RegExp(
        `(${section}:|${section}\\s*:|${section}\\s*-|${section}\\s*–)`,
        'gi',
      );
      cleaned = cleaned.replace(regex, `\n\n${section.toUpperCase()}:`);
    }

    return cleaned;
  }
}

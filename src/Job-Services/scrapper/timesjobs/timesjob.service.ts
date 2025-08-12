import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import {
  fetchWithRetry,
  parseHTML,
  extractText,
  extractAttr,
} from '../utils/http-utils';
import { ScrapperThreadService } from '../thread.service';
import { JobDto, JobResponseDto } from '../../../dto/job-response.dto';

@Injectable()
export class TimesjobService {
  private readonly logger = new Logger(TimesjobService.name);
  private readonly baseUrl =
    'https://m.timesjobs.com/mobile/jobs-search-result.html';
  private readonly detailBaseUrl = 'https://m.timesjobs.com/mobile/job-detail/';

  constructor(private readonly threadService: ScrapperThreadService) {
    // Add stealth plugin to puppeteer (for fallback only)
    puppeteer.use(StealthPlugin());
  }

  /**
   * Main function to get jobs from TimesJobs
   */
  async getJobs(queryOptions: Record<string, any>): Promise<JobResponseDto> {
    try {
      this.logger.log(
        `Fetching TimesJobs with options: ${JSON.stringify(queryOptions)}`,
      );

      // Add pagination parameters with defaults if not provided
      const page = queryOptions.page ? parseInt(queryOptions.page) : 1;
      const size = queryOptions.size ? parseInt(queryOptions.size) : 10;

      // Check if this is a test request (used by combined endpoint)
      const isTestRequest = queryOptions._isTestRequest === true;

      // Generate search URL based on query options
      const url = this.generateUrl(queryOptions);
      this.logger.log(`Generated TimesJobs URL: ${url}`);

      // Get job links - this uses axios by default with puppeteer fallback
      console.time('timesjobs-get-links');
      const links: string[] = await this.getJobLinks(url);
      console.timeEnd('timesjobs-get-links');
      this.logger.log(`Found ${links.length} job links from TimesJobs`);

      if (links.length === 0) {
        return {
          success: false,
          message: 'No jobs found on TimesJobs',
          data: [],
          total: 0,
        };
      }

      // For test requests, just return the count but ensure it's accurate
      if (isTestRequest) {
        this.logger.log(
          `Test request: Found ${links.length} total TimesJobs jobs`,
        );
        return {
          success: true,
          message: 'Test request completed for TimesJobs',
          data: [{
            title: 'Test job from TimesJobs',
            link: links[0],
            companyName: 'Test Company',
            location: 'Test Location',
            experience: '1-2 Years',
            salary: 'As per Industry Standards',
            skills: ['test', 'automation'],
            jobDescription: 'Test job description',
            aboutCompany: 'Test about company',
            postedDate: new Date().toISOString().slice(0, 10),
            source: 'timesjobs',
            timestamp: new Date().toISOString(),
          }],
          total: links.length,
        };
      }

      // Calculate pagination
      const total = links.length;
      const startIndex = (page - 1) * size;
      const endIndex = Math.min(startIndex + size, total);

      // Get links for the current page
      const paginatedLinks = links.slice(startIndex, endIndex);
      this.logger.log(
        `Processing ${paginatedLinks.length} TimesJobs listings for page ${page}...`,
      );

      // Process jobs for the current page in parallel with timeouts
      const JOB_TIMEOUT = 10000; // 10 seconds max per job      // Use Promise.all with individual timeouts for each job
      const jobPromises = paginatedLinks.map((link, index) => {
        return Promise.race([
          this.getJobDetails(link).catch(e => {
            this.logger.error(
              `Error getting job details for ${link}: ${e.message}`,
            );
            return this.getFallbackJob(link);
          }),
          new Promise<JobDto>(resolve =>
            setTimeout(() => {
              this.logger.warn(
                `Job ${index + 1} (${link}) timed out after ${JOB_TIMEOUT / 1000}s`,
              );
              resolve(this.getFallbackJob(link, true));
            }, JOB_TIMEOUT),
          ),
        ]);
      });

      // Wait for all jobs to complete
      let allJobDetails: JobDto[] = await Promise.all(jobPromises);

      // Filter out null results and ensure we have valid jobs
      allJobDetails = allJobDetails.filter(job => job !== null);
      this.logger.log(
        `Successfully processed ${allJobDetails.length} TimesJobs details`,
      );

      // Calculate total pages
      const totalPages = Math.ceil(total / size);

      return {
        success: true,
        message: `Successfully scraped ${allJobDetails.length} jobs from TimesJobs`,
        data: allJobDetails,
        page,
        size,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error: any) {
      this.logger.error(
        `Error scraping TimesJobs: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Error scraping TimesJobs: ${error.message}`,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * This method is kept for backward compatibility
   */
  async query_result(queryOptions: any): Promise<any> {
    const result = await this.getJobs(queryOptions);
    return result.success ? result.data : [];
  }

  /**
   * Generate URL based on search parameters
   */
  private generateUrl(queryOptions: any): string {
    const params = new URLSearchParams();

    // Search keyword
    if (queryOptions.search) {
      params.append('txtKeywords', queryOptions.search);
    }

    // Location
    if (queryOptions.location) {
      params.append('txtLocation', queryOptions.location);
    }

    // Experience is handled differently - need to map values
    if (queryOptions.experience) {
      // TimesJobs uses a specific format for experience
      const expMap: Record<string, string> = {
        '0': '0-1',
        '1': '1-2',
        '2': '2-3',
        '3': '3-5',
        '5': '5-7',
        '7': '7-10',
        '10': '10-15',
        '15': '15+',
      };

      const expValue =
        expMap[queryOptions.experience] || queryOptions.experience;
      params.append('ddlExperience', expValue);
    }

    // Handle special cases for TimesJobs
    if (queryOptions.jobType) {
      params.append('ddlJobType', queryOptions.jobType);
    }

    if (queryOptions.industry) {
      params.append('ddlIndustry', queryOptions.industry);
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Get job links from search page - uses Axios with Puppeteer fallback
   */
  private async getJobLinks(url: string): Promise<string[]> {
    // Try with Axios first (much faster)
    try {
      this.logger.log('Fetching TimesJobs links with Axios');
      return await this.getJobLinksWithAxios(url);
    } catch (error) {
      this.logger.warn(
        'Failed to get TimesJobs links with Axios, falling back to Puppeteer',
      );
      return await this.getJobLinksWithPuppeteer(url);
    }
  }

  /**
   * Get job links using Axios and Cheerio (primary method)
   */
  private async getJobLinksWithAxios(url: string): Promise<string[]> {
    try {
      console.time('timesjobs-axios-links');

      // Use fetchWithRetry from http-utils for better reliability
      const response = await fetchWithRetry(
        url,
        {
          method: 'GET',
          timeout: 15000,
        },
        3,
      );

      const $ = parseHTML(response.data);
      const links: string[] = [];

      // TimesJobs job link selectors - mobile site has cleaner structure
      $('.srp-job-bx .srp-job-heading h3 a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          // Make sure we have the full URL
          const fullUrl = href.startsWith('http')
            ? href
            : `https://m.timesjobs.com${href.startsWith('/') ? '' : '/'}${href}`;
          links.push(fullUrl);
        }
      });

      console.timeEnd('timesjobs-axios-links');
      this.logger.log(`Found ${links.length} TimesJobs links with Axios`);

      if (links.length === 0) {
        throw new Error('No links found with Axios');
      }

      return links;
    } catch (error) {
      this.logger.error(
        `Error getting TimesJobs links with Axios: ${error.message}`,
      );
      throw error; // Rethrow to trigger Puppeteer fallback
    }
  }

  /**
   * Get job links using Puppeteer (fallback method)
   */
  private async getJobLinksWithPuppeteer(url: string): Promise<string[]> {
    this.logger.log('Using Puppeteer to fetch TimesJobs links');
    console.time('timesjobs-puppeteer-links');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      );

      this.logger.log(`Navigating to TimesJobs URL with Puppeteer: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for job listings to appear
      await page
        .waitForSelector('.srp-job-bx', { timeout: 15000 })
        .catch(() =>
          this.logger.warn('Could not find TimesJobs listing elements'),
        );

      // Extract job links
      const links = await page.evaluate(() => {
        const linkElements = document.querySelectorAll(
          '.srp-job-bx .srp-job-heading h3 a',
        );
        return Array.from(linkElements)
          .map(el => {
            const href = el.getAttribute('href');
            if (!href) return '';

            // Make sure we have the full URL
            return href.startsWith('http')
              ? href
              : `https://m.timesjobs.com${href.startsWith('/') ? '' : '/'}${href}`;
          })
          .filter(link => link !== '');
      });

      console.timeEnd('timesjobs-puppeteer-links');
      this.logger.log(`Found ${links.length} TimesJobs links with Puppeteer`);

      await browser.close();
      return links;
    } catch (error) {
      this.logger.error(
        `Error getting TimesJobs links with Puppeteer: ${error.message}`,
      );
      await browser.close();
      return []; // Return empty array if both methods fail
    }
  }

  /**
   * Get job details - uses Axios with Puppeteer fallback
   */
  private async getJobDetails(url: string): Promise<JobDto> {
    // Try with Axios first (much faster)
    try {
      return await this.getJobDetailsWithAxios(url);
    } catch (error) {
      this.logger.warn(
        `Failed to get TimesJobs details with Axios for ${url}, falling back to Puppeteer`,
      );
      return await this.getJobDetailsWithPuppeteer(url);
    }
  }

  /**
   * Get job details using Axios and Cheerio (primary method)
   */
  private async getJobDetailsWithAxios(url: string): Promise<JobDto> {
    try {
      console.time('timesjobs-axios-details');

      // Use fetchWithRetry from http-utils for better reliability
      const response = await fetchWithRetry(
        url,
        {
          method: 'GET',
          timeout: 10000,
        },
        2,
      );

      const $ = parseHTML(response.data);
      console.timeEnd('timesjobs-axios-details');

      // Extract job details using cheerio selectors
      const title = extractText($('.srp-job-bx-new h1'));
      const companyName = extractText($('.srp-job-bx-new h2 span:first-child'));
      const location = extractText($('.srp-job-bx-new .srp-loc'))
        .replace('Location:', '')
        .trim();
      const experience = extractText($('.srp-job-bx-new .srp-exp'));
      const salary = extractText($('.srp-job-bx-new .srp-sal'));

      // Get job description from detailed section
      const jobDescription = extractText($('#JobDescription p'));

      // Get skills - mobile site shows them in a different place
      const skills: string[] = [];
      $('#KeySkills a').each((_, element) => {
        const skill = $(element).text().trim();
        if (skill) skills.push(skill);
      });

      // Get company details
      const aboutCompany = extractText($('#About .comp-detail'));

      // Get posting date
      let postedDate = extractText($('.srp-job-bx-new h2 .posting-time'));
      // Format properly for consistency with other services
      const jobDetails: JobDto = {
        title: title || 'No Title Available',
        link: url,
        companyName: companyName || 'Company Not Listed',
        location: location || 'Location Not Specified',
        experience:
          this.cleanExperienceText(experience) || 'Experience Not Specified',
        salary: salary || 'Salary Not Specified',
        skills: skills.length > 0 ? skills : ['Skills Not Specified'],
        jobDescription:
          this.cleanDescription(jobDescription) || 'No Description Available',
        aboutCompany:
          this.cleanCompanyText(aboutCompany) ||
          'Company Information Not Available',
        postedDate: postedDate || 'Date Not Specified',
        source: 'timesjobs',
        timestamp: new Date().toISOString(),
      };

      return jobDetails;
    } catch (error) {
      this.logger.error(
        `Error getting TimesJobs details with Axios: ${error.message}`,
      );
      throw error; // Rethrow to trigger Puppeteer fallback
    }
  }

  /**
   * Get job details using Puppeteer (fallback method)
   */
  private async getJobDetailsWithPuppeteer(url: string): Promise<JobDto> {
    this.logger.log(`Using Puppeteer to fetch TimesJobs details for: ${url}`);
    console.time('timesjobs-puppeteer-details');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      );

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for job details to appear
      await Promise.race([
        page.waitForSelector('#JobDescription', { timeout: 10000 }),
        page.waitForSelector('.srp-job-bx-new', { timeout: 10000 }),
      ]).catch(() =>
        this.logger.warn('Could not find TimesJobs detail elements'),
      );

      // Extract job details
      const jobDetails: JobDto = await page.evaluate((jobUrl: string) => {
        // Helper function to safely extract text
        const getText = (selector: string): string => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() || '' : '';
        };

        // Extract skills
        const skillElements = document.querySelectorAll('#KeySkills a');
        const skills = Array.from(skillElements)
          .map(el => el.textContent?.trim() || '')
          .filter(Boolean);

        return {
          title: getText('.srp-job-bx-new h1') || 'No Title Available',
          link: jobUrl,
          companyName:
            getText('.srp-job-bx-new h2 span:first-child') ||
            'Company Not Listed',
          location:
            getText('.srp-job-bx-new .srp-loc')
              .replace('Location:', '')
              .trim() || 'Location Not Specified',
          experience:
            getText('.srp-job-bx-new .srp-exp') || 'Experience Not Specified',
          salary: getText('.srp-job-bx-new .srp-sal') || 'Salary Not Specified',
          skills: skills.length > 0 ? skills : ['Skills Not Specified'],
          jobDescription:
            getText('#JobDescription p') || 'No Description Available',
          aboutCompany:
            getText('#About .comp-detail') ||
            'Company Information Not Available',
          postedDate:
            getText('.srp-job-bx-new h2 .posting-time') || 'Date Not Specified',
          source: 'timesjobs',
          timestamp: new Date().toISOString(),
        };
      }, url);

      console.timeEnd('timesjobs-puppeteer-details');

      await browser.close();
      return jobDetails;
    } catch (error) {
      this.logger.error(
        `Error getting TimesJobs details with Puppeteer: ${error.message}`,
      );
      await browser.close();
      return this.getFallbackJob(url); // Return fallback job if both methods fail
    }
  }

  /**
   * Creates a fallback job object when details can't be extracted
   */
  private getFallbackJob(url: string, timedOut: boolean = false): JobDto {
    return {
      title: timedOut ? 'Timed Out Job' : 'Job Listing on TimesJobs',
      link: url,
      companyName: 'Company on TimesJobs',
      location: 'Location unavailable',
      experience: 'Experience details unavailable',
      salary: 'Salary not specified',
      skills: ['Details unavailable'],
      jobDescription: timedOut
        ? 'Could not extract job details because the request timed out.'
        : 'Could not extract job details. This may be due to changes in the site structure.',
      aboutCompany: 'Company information unavailable',
      postedDate: new Date().toISOString().slice(0, 10),
      source: 'timesjobs',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean up experience text from TimesJobs
   */
  private cleanExperienceText(text: string): string {
    if (!text) return '';

    // TimesJobs has extra whitespace and newlines in the experience field
    let clean = text.replace(/\s+/g, ' ').trim();

    // Try to extract just the years part (e.g., "2-5 Years" from "2-5\n\t\t\t\t\t\t  \n\t\t\t\t\t\t  \n\t\t\t\t\t  \n\t\t\t\t\t  Years")
    const match = clean.match(/(\d+\s*-\s*\d+|\d+\+?)\s*Years?/i);
    if (match) {
      clean = match[0];
    }

    return clean;
  }

  /**
   * Clean job description text
   */
  private cleanDescription(text: string): string {
    if (!text) return '';

    // Replace multiple whitespace with single space
    let clean = text.replace(/\s+/g, ' ').trim();

    // Fix common formatting issues
    clean = clean.replace(/:\s+/g, ': '); // Fix spacing after colons
    clean = clean.replace(/\.\s+/g, '. '); // Fix spacing after periods

    // Add line breaks for readability at logical points
    clean = clean.replace(/\. ([A-Z])/g, '.\n$1'); // Add newline after sentences

    return clean;
  }

  /**
   * Clean company text
   */
  private cleanCompanyText(text: string): string {
    if (!text) return '';

    // Remove excess whitespace and clean up formatting
    const clean = text
      .replace(/\s+/g, ' ')
      .replace(/Company\s+/i, '')
      .replace(/Contact Details/i, 'Contact Details: ')
      .trim();

    return clean;
  }
}

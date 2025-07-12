import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapperThreadService } from '../thread.service';

@Injectable()
export class ShineService {
  constructor(private readonly threadService: ScrapperThreadService) {}

  /**
   * Main function to be called from controllers
   * @param queryOptions Options for searching jobs
   * @returns Scraped job data
   */
  async getJobs(queryOptions: any): Promise<any> {
    // Add pagination parameters with defaults if not provided
    const page = queryOptions.page ? parseInt(queryOptions.page) : 1;
    const size = queryOptions.size ? parseInt(queryOptions.size) : 10;
    
    // Check for test request flag
    const isTestRequest = queryOptions._isTestRequest === true;
    
    const url = this.generateUrl(queryOptions);

    console.log("Generated URL:", url);
    if (url === "") {
      console.log("No jobs found");
      return { success: false, message: "No jobs found", data: [] };
    }
    
    try {
      // Fetch all jobs with basic info
      const result = await this.fetchAllJobs(url);
      const allJobs = result.jobs;
      const totalJobsReported = result.totalJobsReported;
      
      // For test requests, just return the count and minimal data
      if (isTestRequest) {
        return {
          success: true,
          message: "Test request completed",
          data: [{title: "Test job", link: "https://test.com"}],
          total: allJobs.length || totalJobsReported
        };
      }
      
      console.log(`Found ${allJobs.length} total jobs (Shine reports ${totalJobsReported} total)`);
      
      // Calculate pagination
      const totalItems = allJobs.length;
      const totalPages = Math.ceil(totalItems / size);
      const startIndex = (page - 1) * size;
      const endIndex = Math.min(startIndex + size, totalItems);
      
      // Check if page is out of bounds
      if (startIndex >= totalItems) {
        console.log(`Page ${page} exceeds available results (${totalItems} total items)`);
        return {
          success: true,
          message: `No results for page ${page}`,
          data: [],
          page,
          size,
          total: totalItems,
          totalPages,
          hasNextPage: false,
          hasPrevPage: page > 1
        };
      }
      
      // Get slice for current page
      const pageItems = allJobs.slice(startIndex, endIndex);
      console.log(`Returning ${pageItems.length} jobs for page ${page} (items ${startIndex+1}-${endIndex})`);
      
      // Only fetch detailed info for page 1 or if explicitly requested
      // And only fetch details for the number of jobs specified by the size parameter
      let finalResults = pageItems;
      if (page === 1 || queryOptions.fetchDetails === true) {
        console.log(`Fetching detailed information for ${pageItems.length} jobs on page ${page} (this may take a moment)...`);
        finalResults = await this.fetchDetailsForJobs(pageItems);
      } else {
        console.log(`Skipping detailed information for page ${page} to improve performance`);
        // Add placeholder fields to indicate detailed info was not fetched
        finalResults = pageItems.map(item => ({
          ...item,
          skills: ["Detailed information not fetched for pagination"],
          jobDescription: "Request with fetchDetails=true parameter to get complete information",
          aboutCompany: "Basic information only (pagination mode)",
          numberOfOpenings: "Not fetched for pagination"
        }));
      }
      
      return {
        success: true,
        message: `Successfully scraped ${finalResults.length} jobs for page ${page}`,
        data: finalResults,
        page,
        size,
        total: totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error: any) {
      console.error("Error during scraping:", error.message);
      return {
        success: false,
        message: `Error during scraping: ${error.message}`,
        data: []
      };
    }
  }

  // Fetch all jobs with basic info
  private async fetchAllJobs(url: string): Promise<any> {
    // Add a timeout to ensure the operation doesn't hang indefinitely
    const timeout = new Promise<any>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out after 20 seconds')), 20000)
    );

    try {
      // First try with Axios (faster)
      console.log('Attempting to fetch with Axios first...');
      const axiosResult = await Promise.race([
        this.fetchAllJobsWithAxios(url),
        timeout
      ]);
      
      if (axiosResult && axiosResult.jobs && axiosResult.jobs.length > 0) {
        console.log(`Successfully fetched ${axiosResult.jobs.length} jobs with Axios`);
        return axiosResult;
      }
      
      // If Axios fails or returns no results, fall back to Puppeteer
      console.log('Axios approach failed or returned no results, falling back to Puppeteer...');
      return await Promise.race([
        this._fetchAllJobsWithPuppeteer(url),
        timeout
      ]);
    } catch (error) {
      console.error("Error in fetchAllJobs with timeout:", error);
      
      // Try Puppeteer as fallback if Axios fails
      try {
        console.log('Error with Axios, trying Puppeteer as fallback...');
        const puppeteerResult = await Promise.race([
          this._fetchAllJobsWithPuppeteer(url),
          timeout
        ]);
        return puppeteerResult;
      } catch (fallbackError) {
        console.error("Both approaches failed:", fallbackError);
        return {
          jobs: [],
          totalJobsReported: 0
        };
      }
    }
  }
  // New implementation using Axios (much faster)
  private async fetchAllJobsWithAxios(url: string): Promise<any> {
    try {
      console.time('axios-fetch');
      // Setup headers to mimic a browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      };
      
      // Make the request
      const response = await axios.get(url, { 
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      // Parse the HTML with cheerio
      const $ = cheerio.load(response.data);
      console.timeEnd('axios-fetch');
      
      // Extract total job count
      let totalJobsReported = 0;
      try {
        const totalText = $('.jsrpLeftSection_found__dWFE0 span.jsrpLeftSection_foundHeading__IiD_O').text();
        const match = totalText.replace(/,/g, '').match(/\d+/);
        totalJobsReported = match ? parseInt(match[0]) : 0;
      } catch (err) {
        console.log('Could not extract total job count');
      }
      
      // Extract job cards
      const jobs: any[] = [];
      $('.jobCardNova_bigCard__W2xn3').each((_, element) => {
        try {
          const titleElement = $(element).find('.jobCardNova_bigCardTopTitleHeading__Rj2sC a');
          const title = titleElement.text().trim();
          
          // Get href and ensure it's an absolute URL
          let link = titleElement.attr('href') || '';
          if (link && !link.startsWith('http')) {
            link = 'https://www.shine.com' + link;
          }
          
          // Get company name
          const companyName = $(element).find('.jobCardNova_bigCardTopTitleName__M_W_m').text().trim();
          
          // Get location
          const location = $(element).find('.jobCardNova_limitsLocation__eHDH7').text().trim();
          
          // Get experience
          const experience = $(element).find('.jobCardNova_bigCardCenterListExp__KTSEc').text().trim();
          
          // Get posted date
          const postedDate = $(element).find('.jobCardNova_postedData__LTERc').text().trim();
          
          // Get skills
          const skills: string[] = [];
          $(element).find('.jobCardNova_skillsLists__7YifX li').each((_, skillElement) => {
            const skillText = $(skillElement).text().trim();
            if (skillText && !skillText.startsWith('+')) {
              skills.push(skillText);
            }
          });
          
          // Get job type
          const jobType = $(element).find('.jobTypeTagNova_commonTag__WsV1E').text().trim();
          
          // Add job to list
          jobs.push({
            title: title || 'Not mentioned',
            link: link || 'Not available',
            companyName: companyName || 'Not mentioned',
            location: location || 'Not mentioned',
            experience: experience || 'Not mentioned',
            postedDate: postedDate || 'Not mentioned',
            skills: skills.length > 0 ? skills : ['Not specified'],
            jobType: jobType || 'Not mentioned'
          });
        } catch (err) {
          console.error('Error parsing job card:', err);
        }
      });
      
      console.log(`Extracted ${jobs.length} jobs with Axios`);
      
      return {
        jobs,
        totalJobsReported
      };
    } catch (error) {
      console.error('Error with Axios approach:', error);
      throw error; // Re-throw to trigger the Puppeteer fallback
    }
  }
  // Original implementation with Puppeteer
  private async _fetchAllJobsWithPuppeteer(url: string): Promise<any> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      defaultViewport: { width: 1280, height: 800 }
    });
    const page = await browser.newPage();
    
    // Disable unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media' || resourceType === 'stylesheet') {
        req.abort();
      } else {
        req.continue();
      }
    });
      
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`Visiting: ${url}`);
      
      // Extract total job count from the page
      let totalJobsReported = 0;
      try {
        totalJobsReported = await page.evaluate(() => {
          // The total job count is in the first span with class "jsrpLeftSection_foundHeading__IiD_O"
          const totalElement = document.querySelector(".jsrpLeftSection_found__dWFE0 span.jsrpLeftSection_foundHeading__IiD_O");
          if (totalElement && totalElement.textContent) {
            // Remove commas and extract the number
            const text = totalElement.textContent.replace(/,/g, '');
            const match = text.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          }
          return 0;
        });
        console.log(`Total jobs reported by Shine: ${totalJobsReported}`);
      } catch (err) {
        console.log("Could not extract total job count from page");
      }
      
      // Make sure the job listing selector is present
      await page.waitForSelector(".jobCardNova_bigCard__W2xn3", { timeout: 8000 }).catch(() => {
        console.log("No jobs found on this page");
        return [];
      });
      
      // Scroll to load more jobs - limit to 3 scrolls for speed
      const maxScrolls = 3;
      let lastCount = 0;
      
      for (let i = 0; i < maxScrolls; i++) {
        // Scroll down
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Wait for content to load - reduced from 1200ms to 800ms
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check current count
        const currentCount = await page.evaluate(() => {
          return document.querySelectorAll(".jobCardNova_bigCard__W2xn3").length;
        });
        
        console.log(`Scroll ${i+1}: Found ${currentCount} jobs`);
        
        // If no new items were loaded after scrolling, stop
        if (currentCount === lastCount) {
          console.log(`No new items after scroll, stopping at ${currentCount} items`);
          break;
        }
        
        lastCount = currentCount;
      }
      
      // Extract all job data
      const jobs = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll(".jobCardNova_bigCard__W2xn3"));
        
        const getText = (el, selector) => {
          const selected = el.querySelector(selector);
          return selected && selected.textContent ? selected.textContent.trim() : "Not mentioned";
        };
        
        const getHref = (el, selector) => {
          const selected = el.querySelector(selector);
          const href = selected ? selected.getAttribute("href") : null;
          return href ? (href.startsWith("http") ? href : "https://www.shine.com" + href) : "Not available";
        };
        
        return items.map(el => ({
          title: getText(el, ".jobCardNova_bigCardTopTitleHeading__Rj2sC a"),
          link: getHref(el, ".jobCardNova_bigCardTopTitleHeading__Rj2sC a"),
          companyName: getText(el, ".jobCardNova_bigCardTopTitleName__M_W_m"),
          location: getText(el, ".jobCardNova_limitsLocation__eHDH7"),
          experience: getText(el, ".jobCardNova_bigCardCenterListExp__KTSEc"),
          postedDate: getText(el, ".jobCardNova_postedData__LTERc"),
          skills: Array.from(el.querySelectorAll(".jobCardNova_skillsLists__7YifX li"))
            .map(skill => skill.textContent ? skill.textContent.trim() : "")
            .filter(skill => !skill.startsWith('+')), // Filter out the "+X" skill count
          jobType: getText(el, ".jobTypeTagNova_commonTag__WsV1E"),
        }));
      });
      
      // Add the total reported jobs count to the result
      return {
        jobs,
        totalJobsReported
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        jobs: [],
        totalJobsReported: 0
      };
    } finally {
      await browser.close();
    }  
  }

  // Fetch detailed info for a list of jobs with Axios first, then fallback to Puppeteer
  private async fetchDetailsForJobs(jobs: any[]): Promise<any[]> {
    console.log(`Fetching details for ${jobs.length} jobs`);
    
    // Define a function to process a single job with Axios first
    const processJob = async (item: any) => {
      try {
        console.log(`Fetching details for: ${item.title}`);
        
        // Try with Axios first (faster)
        try {
          const details = await this.scrapeJobDetailsWithAxios(item.link);
          if (details && Object.keys(details).length > 0) {
            // Handle case where aboutCompany is not available
            let aboutCompanyInfo = details.aboutCompany || "Not available";
            if (aboutCompanyInfo === "Not available" || aboutCompanyInfo === "Not mentioned") {
              // Build alternative description from industry and recruiter details
              const industryInfo = details.industry ? `Industry: ${details.industry}` : "";
              const recruiterInfo = details.recruiterName ? `Recruiter: ${details.recruiterName}` : "";
              const departmentInfo = details.department ? `Department: ${details.department}` : "";
              const jobTypeInfo = details.jobType ? `Job Type: ${details.jobType}` : "";
              
              // Combine available information
              const additionalInfo = [industryInfo, recruiterInfo, departmentInfo, jobTypeInfo]
                .filter(info => info !== "")
                .join(" | ");
                
              // Use this combined info if we have something, otherwise keep "Not available"
              if (additionalInfo) {
                aboutCompanyInfo = additionalInfo;
              }
            }
            
            return {
              ...item,
              skills: details.skills || ["Not specified"],
              jobDescription: details.jobDescription || "Not available",
              aboutCompany: aboutCompanyInfo,
              numberOfOpenings: details.numberOfOpenings || "Not specified",
              industry: details.industry || "Not specified",
              recruiter: details.recruiterName || "Not specified"
            };
          }
        } catch (axiosError) {
          console.log(`Axios approach failed for ${item.title}, falling back to Puppeteer`);
        }
        
        // Fallback to Puppeteer if Axios fails
        const details = await this.scrapeJobDetails(item.link);
        
        // Handle case where aboutCompany is not available
        let aboutCompanyInfo = details.aboutCompany || "Not available";
        if (aboutCompanyInfo === "Not available" || aboutCompanyInfo === "Not mentioned") {
          // Build alternative description from industry and recruiter details
          const industryInfo = details.industry ? `Industry: ${details.industry}` : "";
          const recruiterInfo = details.recruiterName ? `Recruiter: ${details.recruiterName}` : "";
          const departmentInfo = details.department ? `Department: ${details.department}` : "";
          const jobTypeInfo = details.jobType ? `Job Type: ${details.jobType}` : "";
          
          // Combine available information
          const additionalInfo = [industryInfo, recruiterInfo, departmentInfo, jobTypeInfo]
            .filter(info => info !== "")
            .join(" | ");
            
          // Use this combined info if we have something, otherwise keep "Not available"
          if (additionalInfo) {
            aboutCompanyInfo = additionalInfo;
          }
        }
        
        return {
          ...item,
          skills: details.skills || ["Not specified"],
          jobDescription: details.jobDescription || "Not available",
          aboutCompany: aboutCompanyInfo,
          numberOfOpenings: details.numberOfOpenings || "Not specified",
          industry: details.industry || "Not specified",
          recruiter: details.recruiterName || "Not specified"
        };
      } catch (err) {
        console.error(`Error fetching details for ${item.title}:`, err);
        return {
          ...item,
          skills: ["Error retrieving skills"],
          jobDescription: "Error retrieving description",
          aboutCompany: "Error retrieving company info",
          numberOfOpenings: "Error retrieving openings"
        };
      }
    };
    
    // Use thread service to process jobs in parallel
    return await this.threadService.processJobsBatch(jobs, processJob, 3);
  }
  
  // New implementation of job details scraping with Axios
  private async scrapeJobDetailsWithAxios(url: string): Promise<any> {
    try {
      console.time('axios-job-details');
      // Setup headers to mimic a browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      };
      
      // Make the request
      const response = await axios.get(url, { 
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      // Parse the HTML with cheerio
      const $ = cheerio.load(response.data);
      console.timeEnd('axios-job-details');
      
      // Helper function to extract text
      const getText = (selector: string): string => {
        const element = $(selector);
        return element.length ? element.text().trim() : "Not mentioned";
      };
      
      // Extract job title and company
      const jobTitle = getText(".jdCard_jdHeading__PNubI");
      const companyName = getText(".jdCard_jdSubHeading__g2e7D");
      
      // Extract key highlights
      const positions = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(1)")
        .replace(/[^0-9]/g, "") || "Not specified";
      const experience = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(2)");
      const salary = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(3)");
      
      // Extract location with improved selector that handles the new HTML structure
      let location = "";
      try {
        // First try to get from the location div
        const locationDiv = $(".jobdetailsNova_jDLocationTxt___U_GN");
        if (locationDiv.length) {
          location = locationDiv.text().trim();
        }
        
        // If that doesn't work, try to get it from the location link
        if (!location) {
          const locationLink = $(".jobdetailsNova_jDLocationTxt___U_GN a");
          if (locationLink.length) {
            location = locationLink.text().trim();
          }
        }
        
        // Fallback to the entire fourth list item if needed
        if (!location) {
          const fourthItem = $(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(4)");
          if (fourthItem.length) {
            location = fourthItem.text().trim();
          }
        }
      } catch (e) {
        // Final fallback
        location = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(4)");
      }
      
      // Default if all methods fail
      if (!location) {
        location = "Not mentioned";
      }
      
      // Extract job description
      const jobDescription = getText(".jobdetailsNova_jdJobTxt__ND51u");
      
      // Extract other details - more comprehensive approach to get all available details
      const otherDetails: Record<string, string> = {};
      $(".jobdetailsNova_jdOtherDetailsLists__iQ49f li").each((_, element) => {
        const label = $(element).find(".jobdetailsNova_jdRole__xh4DN").text().trim().toLowerCase().replace(/\s+/g, '_');
        const value = $(element).find("strong").text().trim();
        if (label && value) {
          otherDetails[label] = value;
        }
      });
      
      // Extract specific fields from other details
      const department = otherDetails['department'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(1) strong");
      const industry = otherDetails['industry'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(2) strong");
      const education = otherDetails['education'] || "Not specified";
      const recruiterDetails = otherDetails['recruiter_details'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(4) strong");
      const jobTags = otherDetails['job_tags'] || "Not specified";
      const jobType = otherDetails['job_type'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(6) strong");
      
      // Extract skills
      const skills: string[] = [];
      $(".jdSkillsNova_jdSkillsCardTopList__GU29K li a").each((_, element) => {
        const skillText = $(element).text().trim();
        if (skillText) {
          skills.push(skillText);
        }
      });
      
      // Extract about company
      const aboutCompany = getText(".jdAboutCompanyNova_jdAboutCompanyInfo___yGSG");
      
      // Extract recruiter info
      const recruiterName = getText(".aboutRecruiterNova_jbAboutRecruiterHeading__dijid");
      const recruiterLocation = getText(".aboutRecruiterNova_jbAboutRecruiterSubHeading__4zAS_");
      
      return {
        jobTitle,
        companyName,
        numberOfOpenings: positions,
        experience,
        salary,
        location,
        jobDescription,
        department,
        industry,
        education,
        recruiterDetails,
        jobTags,
        jobType,
        skills: skills.length > 0 ? skills : ["Not specified"],
        aboutCompany,
        recruiterName,
        recruiterLocation,
        otherDetails: JSON.stringify(otherDetails) // Store all other details as JSON for debugging
      };
    } catch (error) {
      console.error("Error scraping job details with Axios:", error);
      throw error; // Re-throw to trigger the Puppeteer fallback
    }
  }
  // Scrape details from a single job page
  private async scrapeJobDetails(url: string): Promise<any> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      defaultViewport: { width: 1280, height: 800 }
    });
    const page = await browser.newPage();
    
    // Disable unnecessary resources for faster load
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Block more resource types for faster loading
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media' || 
          resourceType === 'stylesheet' || resourceType === 'other' || 
          (resourceType === 'script' && !req.url().includes('essential'))) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Set a longer default timeout
    page.setDefaultTimeout(15000); // Increase from 6000ms to 15000ms for reliability

    try {
      // Cache disabled for faster loading
      await page.setCacheEnabled(false);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }); // Increased timeout
      console.log(`Visiting: ${url}`);

      // Wait for job details container with longer timeout
      await page.waitForSelector(".jobdetailsNova_jobdetails__j8y_W", { timeout: 10000 }).catch(() => { // Increased timeout
        console.log("Could not find job details section, returning default values");
      });
      
      const results = await page.evaluate(() => {
        const getText = (selector) => {
          const element = document.querySelector(selector);
          return element && element.textContent ? element.textContent.trim() : "Not mentioned";
        };

        // Extract job title and company
        const jobTitle = getText(".jdCard_jdHeading__PNubI");
        const companyName = getText(".jdCard_jdSubHeading__g2e7D");
        
        // Extract key highlights
        const positions = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(1)")
          .replace(/[^0-9]/g, "") || "Not specified";
        const experience = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(2)");
        const salary = getText(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(3)");
        
        // Extract location with improved selector that handles the new HTML structure
        let location = "";
        try {
          // First try to get from the location div
          const locationDiv = document.querySelector(".jobdetailsNova_jDLocationTxt___U_GN");
          if (locationDiv) {
            location = locationDiv.textContent?.trim() || "";
          }
          
          // If that doesn't work, try to get it from the location link
          if (!location) {
            const locationLink = document.querySelector(".jobdetailsNova_jDLocationTxt___U_GN a");
            if (locationLink) {
              location = locationLink.textContent?.trim() || "";
            }
          }
          
          // Fallback to the entire fourth list item if needed
          if (!location) {
            const fourthItem = document.querySelector(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(4)");
            if (fourthItem) {
              // Extract just the text without the image
              const locationText = Array.from(fourthItem.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'IMG'))
                .map(node => node.textContent?.trim() || "")
                .join(" ")
                .trim();
              
              if (locationText) {
                location = locationText;
              }
            }
          }
          
          // One more fallback - try other location classes
          if (!location) {
            const otherLocationSelectors = [
              ".jdLocation", 
              "[data-type='location']",
              ".location-value"
            ];
            
            for (const selector of otherLocationSelectors) {
              const element = document.querySelector(selector);
              if (element && element.textContent) {
                location = element.textContent.trim();
                break;
              }
            }
          }
        } catch (e) {
          console.error("Error extracting location:", e);
          // Final fallback
          location = document.querySelector(".jobdetailsNova_jdKeyHighlightList__nAcEl li:nth-child(4)")?.textContent?.trim() || "Not mentioned";
        }
        
        // Default if all methods fail
        if (!location) {
          location = "Not mentioned";
        }
        
        // Extract job description
        const jobDescription = getText(".jobdetailsNova_jdJobTxt__ND51u");
        
        // Extract other details - more comprehensive approach to get all available details
        const otherDetails = {};
        const otherDetailLabels = Array.from(document.querySelectorAll(".jobdetailsNova_jdOtherDetailsLists__iQ49f li .jobdetailsNova_jdRole__xh4DN"));
        
        otherDetailLabels.forEach(label => {
          const labelText = label.textContent?.trim();
          if (labelText && label.parentElement) {
            const valueElement = label.parentElement.querySelector('strong');
            if (valueElement) {
              otherDetails[labelText.toLowerCase().replace(/\s+/g, '_')] = valueElement.textContent?.trim() || "Not mentioned";
            }
          }
        });
        
        // Extract specific fields from other details
        const department = otherDetails['department'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(1) strong");
        const industry = otherDetails['industry'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(2) strong");
        const education = otherDetails['education'] || "Not specified";
        const recruiterDetails = otherDetails['recruiter_details'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(4) strong");
        const jobTags = otherDetails['job_tags'] || "Not specified";
        const jobType = otherDetails['job_type'] || getText(".jobdetailsNova_jdOtherDetailsLists__iQ49f li:nth-child(6) strong");
        
        // Extract skills
        const skills = Array.from(document.querySelectorAll(".jdSkillsNova_jdSkillsCardTopList__GU29K li a"))
          .map(skill => skill.textContent ? skill.textContent.trim() : "");
          
        // Extract about company
        const aboutCompany = getText(".jdAboutCompanyNova_jdAboutCompanyInfo___yGSG");
        
        // Extract recruiter info
        const recruiterName = getText(".aboutRecruiterNova_jbAboutRecruiterHeading__dijid");
        const recruiterLocation = getText(".aboutRecruiterNova_jbAboutRecruiterSubHeading__4zAS_");

        return {
          jobTitle,
          companyName,
          numberOfOpenings: positions,
          experience,
          salary,
          location,
          jobDescription,
          department,
          industry,
          education,
          recruiterDetails,
          jobTags,
          jobType,
          skills: skills.length > 0 ? skills : ["Not specified"],
          aboutCompany,
          recruiterName,
          recruiterLocation,
          otherDetails: JSON.stringify(otherDetails) // Store all other details as JSON for debugging
        };
      });

      console.log(`Successfully scraped details for job with ${results.skills ? results.skills.length : 0} skills`);
      return results;

    } catch (err: any) {
      console.error("Error scraping job details:", err.message);
      return {
        skills: ["Error retrieving skills"],
        jobDescription: "Error retrieving description",
        aboutCompany: "Error retrieving company info",
        numberOfOpenings: "Error retrieving openings"
      };
    } finally {
      await browser.close();
    }
  }
    // Helper function to clean and structure job description text
  private cleanJobDescription(text: string): any {
    if (!text || text === "Not available") {
      return { 
        full: "Not available",
        summary: "Not available" 
      };
    }
    
    // Remove excessive whitespace and normalize line breaks
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    // Create a summary (first 150 characters)
    const summary = cleanedText.substring(0, 150) + (cleanedText.length > 150 ? '...' : '');
    
    // Extract sections if they exist (looking for common patterns)
    const sections: any = {};
    
    // Try to identify key sections using regex
    const responsibilities = text.match(/Key Responsibilities:[\s\S]*?(?=Required Skills|Education|Why Join|$)/i);
    if (responsibilities) {
      sections.responsibilities = responsibilities[0].replace('Key Responsibilities:', '').trim();
    }
    
    const skills = text.match(/Required Skills[\s\S]*?(?=Education|Why Join|$)/i);
    if (skills) {
      sections.skills = skills[0].replace(/Required Skills.*?:/i, '').trim();
    }
    
    return {
      full: text,
      summary,
      sections
    };
  }
    // Generate URL based on query options
  private generateUrl(queryOptions: any): string {
    let baseUrl = "https://www.shine.com/job-search/";
    let queryParams: string[] = [];
    
    // Add search query to the URL path
    if (queryOptions.search) {
      const searchTerm = queryOptions.search.toLowerCase().split(" ").join("-");
      baseUrl += `${searchTerm}-jobs`;
      
      // Add page number to URL path if specified (like -2, -3)
      const pageNum = queryOptions.page ? parseInt(queryOptions.page) : 1;
      if (pageNum > 1) {
        baseUrl += `-${pageNum}`;
      }
      
      // Also add to query parameters
      queryParams.push(`q=${encodeURIComponent(queryOptions.search)}`);
      queryParams.push(`qActual=${encodeURIComponent(queryOptions.search)}`);
    }
    
    // Add experience filter (assuming format like 3 for 3 years)
    if (queryOptions.experience) {
      queryParams.push(`fexp=${queryOptions.experience}`);
    }
    
    // Add sort parameter (1 seems to be relevance)
    queryParams.push("sort=1");
    
    // Add employment type
    // 4 appears to be for full-time positions
    if (queryOptions.employmentType) {
      queryParams.push(`emp_type=${queryOptions.employmentType}`);
    } else if (queryOptions.work_from_home) {
      // If work from home is specified
      queryParams.push("emp_type=4");
    }
    
    // Combine URL and query parameters
    if (queryParams.length > 0) {
      baseUrl += "?" + queryParams.join("&");
    }
    
    return baseUrl;
  }
}


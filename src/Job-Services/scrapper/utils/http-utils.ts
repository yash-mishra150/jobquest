import axios from 'axios';
import * as cheerio from 'cheerio';

// Collection of user agents to rotate through for anti-bot protection
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
];

// Get a random user agent from the list
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Common headers for HTTP requests to mimic a browser
export function getCommonHeaders(referer?: string): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    Connection: 'keep-alive',
    'Cache-Control': 'max-age=0',
    ...(referer ? { Referer: referer } : {}),
  };
}

// Function to make HTTP requests with retries
export async function fetchWithRetry(
  url: string,
  options: any = {},
  maxRetries = 3,
): Promise<any> {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      // Add random user agent if not specified
      if (!options.headers || !options.headers['User-Agent']) {
        options.headers = {
          ...options.headers,
          ...getCommonHeaders(url),
        };
      }

      // Set default timeout if not specified
      if (!options.timeout) {
        options.timeout = 15000; // 15 seconds
      }

      return await axios(url, options);
    } catch (error) {
      lastError = error;
      retries++;
      console.log(`Retry ${retries}/${maxRetries} for URL: ${url}`);

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }

  // If all retries failed, throw the last error
  throw lastError;
}

// Load HTML with cheerio
export function parseHTML(html: string): cheerio.CheerioAPI {
  return cheerio.load(html);
}

// Extract text from cheerio element with error handling
export function extractText($element: cheerio.Cheerio<any> | null): string {
  if (!$element || $element.length === 0) return '';
  return $element.text().trim();
}

// Extract attribute from cheerio element with error handling
export function extractAttr(
  $element: cheerio.Cheerio<any> | null,
  attr: string,
): string {
  if (!$element || $element.length === 0) return '';
  return $element.attr(attr) || '';
}

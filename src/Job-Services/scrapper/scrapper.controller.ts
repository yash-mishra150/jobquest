import { Controller, Post, Body } from '@nestjs/common';
import { NaukriService } from './naukri/naukri.service';
import { ScrapperQueryDto } from 'src/dto/scrapper.dto';
import { ShineService } from './shine/shine.service';
import { TimesjobService } from './timesjobs/timesjob.service';
import { ScrapperThreadService } from './thread.service';

@Controller('scrapper')
export class ScrapperController {  constructor(
    private readonly naukriService: NaukriService,
    private readonly shineService: ShineService,
    private readonly timesjobService: TimesjobService,
    private readonly threadService: ScrapperThreadService,
  ) { }

  // Simple in-memory cache for combined requests
  private cache: Map<string, { timestamp: number, data: any }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache expiry

  // Generate cache key from request parameters
  private getCacheKey(params: any): string {
    const { search, page, size } = params;
    return `combined:${search || 'all'}:${page || 1}:${size || 10}`;
  }
  // Check if we have a valid cached response
  private getCachedResponse(key: string): any | null {
    if (!this.cache.has(key)) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    
    if (now - cached.timestamp > this.CACHE_TTL) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Using cached response for ${key}`);
    return cached.data;
  }

  // Store response in cache
  private cacheResponse(key: string, data: any): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
    console.log(`Cached response for ${key}`);
  }
  @Post('naukri')
  async getJobs(@Body() bodyParams: ScrapperQueryDto) {
    // Ensure size is properly set
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    
    // Set appropriate flags for better performance
    if (!bodyParams.hasOwnProperty('fetchDetails')) {
      bodyParams.fetchDetails = true; // Default to fetching details for individual endpoint
    }
    
    // Add thread service support
    (bodyParams as any).useThreads = true;
    
    return this.naukriService.getJobs(bodyParams);
  }
  @Post('shine')
  async getJobsShine(@Body() bodyParams: ScrapperQueryDto) {
    // Ensure size is properly set
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    
    // Set appropriate flags for better performance
    if (!bodyParams.hasOwnProperty('fetchDetails')) {
      bodyParams.fetchDetails = true; // Default to fetching details for individual endpoint
    }
    
    // Add thread service support for parallelization
    (bodyParams as any).useThreads = true;
    
    return this.shineService.getJobs(bodyParams);
  }

  @Post('timesjobs')
  async getJobsTimesJobs(@Body() bodyParams: ScrapperQueryDto) {
    // Ensure size is properly set
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    
    // Set appropriate flags for better performance
    if (!bodyParams.hasOwnProperty('fetchDetails')) {
      bodyParams.fetchDetails = true; // Default to fetching details for individual endpoint
    }
    
    // Add thread service support for parallelization
    (bodyParams as any).useThreads = true;
    
    return this.timesjobService.getJobs(bodyParams);
  }

  @Post('combined')
  async getCombinedJobs(@Body() bodyParams: ScrapperQueryDto) {
    // Just forward to the combinedFaster implementation
    return this.getCombinedFasterJobs(bodyParams);
  }

  @Post('combinedfaster')
  async getCombinedFasterJobs(@Body() bodyParams: ScrapperQueryDto) {
    const size = bodyParams.size || 10;
    const page = bodyParams.page || 1;

    // Check cache for existing response
    const cacheKey = `faster:${this.getCacheKey(bodyParams)}`;
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Optimize for performance by default
    const shouldFetchDetails = bodyParams.fetchDetails === true;
    const isFastMode = (bodyParams as any)._fastMode !== false; // Default to fast mode
    
    // Split the requested size evenly between both services
    // For size=10, get 5 from TimesJobs and 5 from Shine
    const perServiceSize = Math.ceil(size / 2); // Each service gets half of the requested size
    
    // Fast test requests - set all flags for maximum performance
    const testParams = { 
      ...bodyParams, 
      size: 1, 
      page: 1,
      fetchDetails: false,
      _isTestRequest: true,
      _fastMode: true
    };
    
    console.time('combined-faster-jobs');
    try {
      // Make small test requests to determine availability - run in parallel
      const [timesJobsTestResponse, shineTestResponse] = await Promise.all([
        this.timesjobService.getJobs(testParams),
        this.shineService.getJobs(testParams)
      ]);
      
      console.timeLog('combined-faster-jobs', 'Test requests completed');
      
      const timesJobsTotal = timesJobsTestResponse.total || 0;
      const shineTotal = shineTestResponse.total || 0;
      const totalAvailable = timesJobsTotal + shineTotal;
      
      // Allocate job distribution
      let timesJobsSize, shineSize;
      
      // Empty result handling
      if (totalAvailable === 0) {
        // If no results found, try both services with equal distribution
        timesJobsSize = perServiceSize;
        shineSize = perServiceSize;
      } else {
        // Always get exactly half of the requested size from each service if possible
        timesJobsSize = perServiceSize;
        shineSize = perServiceSize;
        
        // If one service has fewer results than its allocation, shift the remaining to the other
        if (timesJobsTotal < perServiceSize && shineTotal > perServiceSize) {
          // TimesJobs has fewer results than allocated, shift the remaining to Shine
          const shortfall = perServiceSize - timesJobsTotal;
          timesJobsSize = Math.max(0, timesJobsTotal);
          shineSize = Math.min(shineTotal, perServiceSize + shortfall);
        } else if (shineTotal < perServiceSize && timesJobsTotal > perServiceSize) {
          // Shine has fewer results than allocated, shift the remaining to TimesJobs
          const shortfall = perServiceSize - shineTotal;
          shineSize = Math.max(0, shineTotal);
          timesJobsSize = Math.min(timesJobsTotal, perServiceSize + shortfall);
        } else {
          // Both services have enough results
          timesJobsSize = Math.min(timesJobsTotal, perServiceSize);
          shineSize = Math.min(shineTotal, perServiceSize);
        }
      }
      
      // Ensure we're requesting exactly the needed number from each service
      // We want timesJobsSize + shineSize to be exactly equal to size
      const totalRequestedSize = timesJobsSize + shineSize;
      if (totalRequestedSize > size) {
        // If we're requesting too many, reduce proportionally
        const reduction = totalRequestedSize - size;
        if (timesJobsSize > 0 && shineSize > 0) {
          // Distribute the reduction proportionally
          const timesJobsReduction = Math.floor(reduction * (timesJobsSize / totalRequestedSize));
          const shineReduction = reduction - timesJobsReduction;
          timesJobsSize = Math.max(0, timesJobsSize - timesJobsReduction);
          shineSize = Math.max(0, shineSize - shineReduction);
        } else if (timesJobsSize > 0) {
          timesJobsSize = Math.max(0, timesJobsSize - reduction);
        } else {
          shineSize = Math.max(0, shineSize - reduction);
        }
      }
      
      console.log(`Optimized distribution - TimesJobs: ${timesJobsSize}, Shine: ${shineSize} (Total: ${timesJobsSize + shineSize})`);
      
      // Run requests with optimized parameters
      const timesJobsParams = { 
        ...bodyParams, 
        size: timesJobsSize, 
        page,
        fetchDetails: shouldFetchDetails,
        useThreads: true, // Ensure ThreadService is used
        _fastMode: true,   // Add fast mode flag to optimize performance
        _minimizeDetails: true, // Reduce amount of data returned
        _skipDescriptions: !shouldFetchDetails // Skip lengthy descriptions for better performance
      };
      
      const shineParams = { 
        ...bodyParams, 
        size: shineSize, 
        page,
        fetchDetails: shouldFetchDetails,
        _fastMode: true,   // Add fast mode flag to optimize performance
        _minimizeDetails: true, // Reduce amount of data returned
        _skipDescriptions: !shouldFetchDetails // Skip lengthy descriptions for better performance
      };
      
      // Run both requests in parallel with timeout to prevent hanging
      console.log(`Starting parallel scraping with TimesJobs(${timesJobsSize}) and Shine(${shineSize})`);
      const startTime = Date.now();
      
      // Add a timeout promise to prevent hanging
      const timeout = new Promise<any>(resolve => {
        setTimeout(() => {
          console.warn('Scraping operation timed out after 15 seconds');
          resolve({ data: [], total: 0, timedOut: true });
        }, 15000); // 15 seconds timeout - more reasonable for larger requests
      });
      
      // Race the requests against the timeout
      const [timesJobsResponse, shineResponse] = await Promise.all([
        timesJobsSize > 0 
          ? Promise.race([this.timesjobService.getJobs(timesJobsParams), timeout]) 
          : { data: [], total: 0 },
        shineSize > 0 
          ? Promise.race([this.shineService.getJobs(shineParams), timeout]) 
          : { data: [], total: 0 }
      ]);
      
      const processingTime = Date.now() - startTime;
      console.log(`Parallel scraping completed in ${processingTime}ms`);
      console.timeLog('combined-faster-jobs', 'Main requests completed');
      
      // Process results
      const timesJobsJobs = timesJobsResponse.data || [];
      const shineJobs = shineResponse.data || [];
      console.log(`Actual jobs returned - TimesJobs: ${timesJobsJobs.length}, Shine: ${shineJobs.length}`);
      
      // Handle potential failures from either service
      if (timesJobsSize > 0 && timesJobsJobs.length === 0) {
        console.warn("TimesJobs returned 0 jobs despite being requested - this may indicate a problem");
      }
      
      if (shineSize > 0 && shineJobs.length === 0) {
        console.warn("Shine returned 0 jobs despite being requested - this may indicate a problem");
      }
      
      // Combine jobs in an alternating pattern to ensure fair representation
      let combinedJobs: any[] = [];
      const maxLength = Math.max(timesJobsJobs.length, shineJobs.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (i < timesJobsJobs.length) combinedJobs.push(timesJobsJobs[i]);
        if (i < shineJobs.length) combinedJobs.push(shineJobs[i]);
      }
      
      // Add source field to each job if not already present
      const taggedJobs = combinedJobs.map(job => {
        if (job.source) return job;
        
        const isFromTimesJobs = timesJobsJobs.some(timesJob => timesJob.link === job.link);
        return {
          ...job,
          source: isFromTimesJobs ? 'timesjobs' : 'shine'
        };
      });
      
      // Calculate pagination info
      const totalTimesJobsJobs = timesJobsResponse.total || 0;
      const totalShineJobs = shineResponse.total || 0;
      const totalJobs = totalTimesJobsJobs + totalShineJobs;
      const totalPages = Math.ceil(totalJobs / size);
      
      console.timeEnd('combined-faster-jobs');
      
      // Ensure we return exactly the requested number of jobs if available
      const resultData = taggedJobs.slice(0, size);
      
      // Log if we couldn't get enough jobs
      if (resultData.length < size && combinedJobs.length > 0) {
        console.warn(`Could only return ${resultData.length} jobs, fewer than the requested ${size}`);
      }
      
      // Count how many jobs we actually got from each source
      const timesJobsCount = resultData.filter(job => job.source === 'timesjobs').length;
      const shineCount = resultData.filter(job => job.source === 'shine').length;
      
      const response = {
        success: true,
        message: `Combined jobs from TimesJobs(${timesJobsCount}) and Shine(${shineCount})`,
        data: resultData,
        page,
        size,
        total: totalJobs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        sources: {
          timesjobs: {
            count: timesJobsCount,
            total: totalTimesJobsJobs,
            requested: timesJobsSize
          },
          shine: {
            count: shineCount,
            total: totalShineJobs,
            requested: shineSize
          }
        }
      };

      // Cache the response
      this.cacheResponse(cacheKey, response);

      return response;
    } catch (error) {
      console.error("Error fetching combined jobs:", error);
      return {
        success: false,
        message: "Error fetching combined jobs: " + error.message,
        data: [],
        page,
        size,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
    }
  }
}
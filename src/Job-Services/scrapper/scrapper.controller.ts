import { Controller, Post, Body, Get } from '@nestjs/common';
import { NaukriService } from './naukri/naukri.service';
import { ScrapperQueryDto } from 'src/dto/scrapper.dto';
import { ShineService } from './shine/shine.service';
import { TimesjobService } from './timesjobs/timesjob.service';
import { ScrapperThreadService } from './thread.service';
import { JobDto, JobResponseDto } from 'src/dto/job-response.dto';

interface CacheData {
  timestamp: number;
  data: JobResponseDto;
}

interface CombinedJob extends JobDto {
  source: string;
}

@Controller('scrapper')
export class ScrapperController {
  constructor(
    private readonly naukriService: NaukriService,
    private readonly shineService: ShineService,
    private readonly timesjobService: TimesjobService,
    private readonly threadService: ScrapperThreadService,
  ) {}

  private cache: Map<string, CacheData> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private getCacheKey(params: ScrapperQueryDto): string {
    const { search, page, size } = params;
    return `combined:${search || 'all'}:${page || 1}:${size || 10}`;
  }

  private getCachedResponse(key: string): JobResponseDto | null {
    if (!this.cache.has(key)) return null;
    const cached = this.cache.get(key);
    if (!cached) return null;
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    console.log(`Using cached response for ${key}`);
    return cached.data;
  }

  private cacheResponse(key: string, data: JobResponseDto): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data,
    });
    console.log(`Cached response for ${key}`);
  }

  @Post('naukri')
  async getJobs(@Body() bodyParams: ScrapperQueryDto): Promise<JobResponseDto> {
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    if (typeof bodyParams.fetchDetails === 'undefined') {
      bodyParams.fetchDetails = true;
    }
    (bodyParams as ScrapperQueryDto & { useThreads: boolean }).useThreads = true;
    return this.naukriService.getJobs(bodyParams);
  }

  @Post('shine')
  async getJobsShine(@Body() bodyParams: ScrapperQueryDto): Promise<JobResponseDto> {
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    if (typeof bodyParams.fetchDetails === 'undefined') {
      bodyParams.fetchDetails = true;
    }
    (bodyParams as ScrapperQueryDto & { useThreads: boolean }).useThreads = true;
    return this.shineService.getJobs(bodyParams);
  }

  @Post('timesjobs')
  async getJobsTimesJobs(@Body() bodyParams: ScrapperQueryDto): Promise<JobResponseDto> {
    const size = bodyParams.size || 10;
    bodyParams.size = size;
    if (typeof bodyParams.fetchDetails === 'undefined') {
      bodyParams.fetchDetails = true;
    }
    (bodyParams as ScrapperQueryDto & { useThreads: boolean }).useThreads = true;
    return this.timesjobService.getJobs(bodyParams);
  }

  @Post('combined')
  async getCombinedJobs(@Body() bodyParams: ScrapperQueryDto): Promise<JobResponseDto> {
    return this.getCombinedFasterJobs(bodyParams);
  }

  @Post('combinedfaster')
  async getCombinedFasterJobs(@Body() bodyParams: ScrapperQueryDto): Promise<JobResponseDto> {
    const size = bodyParams.size || 10;
    const page = bodyParams.page || 1;
    const cacheKey = `faster:${this.getCacheKey(bodyParams)}`;
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    const shouldFetchDetails = bodyParams.fetchDetails === true;
    const perServiceSize = Math.ceil(size / 2);
    const testParams: ScrapperQueryDto = {
      ...bodyParams,
      size: 1,
      page: 1,
      fetchDetails: false,
      _isTestRequest: true,
      _fastMode: true,
    };
    console.time('combined-faster-jobs');
    try {
      const [timesJobsTestResponse, shineTestResponse] = await Promise.all([
        this.timesjobService.getJobs(testParams),
        this.shineService.getJobs(testParams),
      ]);
      console.timeLog('combined-faster-jobs', 'Test requests completed');
      const timesJobsTotal = timesJobsTestResponse.total || 0;
      const shineTotal = shineTestResponse.total || 0;
      const totalAvailable = timesJobsTotal + shineTotal;
      let timesJobsSize: number, shineSize: number;
      if (totalAvailable === 0) {
        timesJobsSize = perServiceSize;
        shineSize = perServiceSize;
      } else {
        timesJobsSize = perServiceSize;
        shineSize = perServiceSize;
        if (timesJobsTotal < perServiceSize && shineTotal > perServiceSize) {
          const shortfall = perServiceSize - timesJobsTotal;
          timesJobsSize = Math.max(0, timesJobsTotal);
          shineSize = Math.min(shineTotal, perServiceSize + shortfall);
        } else if (shineTotal < perServiceSize && timesJobsTotal > perServiceSize) {
          const shortfall = perServiceSize - shineTotal;
          shineSize = Math.max(0, shineTotal);
          timesJobsSize = Math.min(timesJobsTotal, perServiceSize + shortfall);
        } else {
          timesJobsSize = Math.min(timesJobsTotal, perServiceSize);
          shineSize = Math.min(shineTotal, perServiceSize);
        }
      }
      const totalRequestedSize = timesJobsSize + shineSize;
      if (totalRequestedSize > size) {
        const reduction = totalRequestedSize - size;
        if (timesJobsSize > 0 && shineSize > 0) {
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
      const timesJobsParams: ScrapperQueryDto = {
        ...bodyParams,
        size: timesJobsSize,
        page,
        fetchDetails: shouldFetchDetails,
        useThreads: true,
        _fastMode: true,
        _minimizeDetails: true,
        _skipDescriptions: !shouldFetchDetails,
      };
      const shineParams: ScrapperQueryDto = {
        ...bodyParams,
        size: shineSize,
        page,
        fetchDetails: shouldFetchDetails,
        _fastMode: true,
        _minimizeDetails: true,
        _skipDescriptions: !shouldFetchDetails,
      };
      const timeout = new Promise<JobResponseDto>(resolve => {
        setTimeout(() => {
          console.warn('Scraping operation timed out after 15 seconds');
          resolve({
            success: false,
            message: 'Timeout',
            data: [],
            page,
            size,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          });
        }, 15000);
      });
      const [timesJobsResponse, shineResponse] = await Promise.all([
        timesJobsSize > 0 ? Promise.race([this.timesjobService.getJobs(timesJobsParams), timeout]) : { data: [], total: 0 },
        shineSize > 0 ? Promise.race([this.shineService.getJobs(shineParams), timeout]) : { data: [], total: 0 },
      ]);
      const processingTime = Date.now() - Date.now();
      console.log(`Parallel scraping completed in ${processingTime}ms`);
      console.timeLog('combined-faster-jobs', 'Main requests completed');
      const timesJobsJobs: JobDto[] = (timesJobsResponse.data as JobDto[]) || [];
      const shineJobs: JobDto[] = (shineResponse.data as JobDto[]) || [];
      console.log(`Actual jobs returned - TimesJobs: ${timesJobsJobs.length}, Shine: ${shineJobs.length}`);
      if (timesJobsSize > 0 && timesJobsJobs.length === 0) {
        console.warn('TimesJobs returned 0 jobs despite being requested - this may indicate a problem');
      }
      if (shineSize > 0 && shineJobs.length === 0) {
        console.warn('Shine returned 0 jobs despite being requested - this may indicate a problem');
      }
      const combinedJobs: CombinedJob[] = [];
      const maxLength = Math.max(timesJobsJobs.length, shineJobs.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < timesJobsJobs.length) combinedJobs.push({ ...timesJobsJobs[i], source: 'timesjobs' });
        if (i < shineJobs.length) combinedJobs.push({ ...shineJobs[i], source: 'shine' });
      }
      const resultData = combinedJobs.slice(0, size);
      const timesJobsCount = resultData.filter(job => job.source === 'timesjobs').length;
      const shineCount = resultData.filter(job => job.source === 'shine').length;
      const totalTimesJobsJobs = timesJobsResponse.total || 0;
      const totalShineJobs = shineResponse.total || 0;
      const totalJobs = totalTimesJobsJobs + totalShineJobs;
      const totalPages = Math.ceil(totalJobs / size);
      console.timeEnd('combined-faster-jobs');
      const response: JobResponseDto = {
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
            requested: timesJobsSize,
          },
          shine: {
            count: shineCount,
            total: totalShineJobs,
            requested: shineSize,
          },
        },
      };
      this.cacheResponse(cacheKey, response);
      return response;
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      return {
        success: false,
        message: 'Error fetching combined jobs: ' + message,
        data: [],
        page,
        size,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

  @Get('featured')
  async getFeaturedJobs(): Promise<JobResponseDto> {
    const timesJobsParams: ScrapperQueryDto = {
      size: 5,
      page: 1,
      fetchDetails: true,
      useThreads: true,
      _fastMode: true,
      search: 'office-jobs',
    };
    const shineParams: ScrapperQueryDto = {
      size: 5,
      page: 1,
      fetchDetails: true,
      useThreads: true,
      _fastMode: true,
      search: 'remote-jobs',
    };
    try {
      const [timesJobs, shine] = await Promise.all([
        this.timesjobService.getJobs(timesJobsParams),
        this.shineService.getJobs(shineParams),
      ]);
      let jobs: JobDto[] = [...(timesJobs.data || []), ...(shine.data || [])];
      jobs = jobs.sort(() => Math.random() - 0.5);
      return {
        success: true,
        message: 'Featured jobs for guests',
        data: jobs.slice(0, 10),
        page: 1,
        size: 10,
        total: jobs.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      return {
        success: false,
        message: 'Could not fetch featured jobs: ' + message,
        data: [],
        page: 1,
        size: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }
}

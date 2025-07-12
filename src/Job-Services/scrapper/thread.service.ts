import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'worker_threads';
import * as path from 'path';

@Injectable()
export class ScrapperThreadService {
  private readonly maxThreads: number;
  private readonly logger = new Logger(ScrapperThreadService.name);

  constructor() {
    // Use a safer way to determine thread count
    try {
      const os = require('os');
      this.maxThreads = Math.min(Math.floor(os.cpus().length / 2), 4);
    } catch (error) {
      this.maxThreads = 2; // Default to 2 threads if os module is not available
    }
    this.logger.log(`Thread service initialized with ${this.maxThreads} max threads`);
  }

  /**
   * Helper method to run a task with a timeout
   */
  async runWithTimeout<T>(task: () => Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    return Promise.race([task(), timeoutPromise]);
  }
  
  /**
   * Helper method to run multiple tasks in parallel with limits
   */
  async runParallel<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrent: number = 5,
    timeoutMs: number = 30000
  ): Promise<T[]> {
    this.logger.log(`Running ${tasks.length} tasks in parallel (max ${maxConcurrent} concurrent)`);
    
    const results: T[] = [];
    const runningTasks: Promise<void>[] = [];
    const taskQueue = [...tasks];
    
    // Process queue until all tasks are done
    while (taskQueue.length > 0 || runningTasks.length > 0) {
      // Fill up to max concurrent tasks
      while (runningTasks.length < maxConcurrent && taskQueue.length > 0) {
        const task = taskQueue.shift();
        if (!task) continue;
        
        const runTask = async () => {
          try {
            const result = await this.runWithTimeout(task, timeoutMs);
            results.push(result);
          } catch (error) {
            this.logger.error(`Task failed: ${error.message}`);
          }
        };
        
        const taskPromise = runTask().finally(() => {
          // Remove this task from running tasks when done
          const index = runningTasks.indexOf(taskPromise);
          if (index !== -1) {
            runningTasks.splice(index, 1);
          }
        });
        
        runningTasks.push(taskPromise);
      }
      
      // Wait for at least one task to complete before checking again
      if (runningTasks.length > 0) {
        await Promise.race(runningTasks);
      }
    }
    
    return results;
  }

  /**
   * Process jobs in parallel batches using worker threads
   * @param jobs Array of jobs to process
   * @param processFunction Function to process each job
   * @returns Processed job results
   */
  async processJobsBatch<T, R>(
    jobs: T[], 
    processFunction: (job: T) => Promise<R>,
    batchSize: number = 3
  ): Promise<R[]> {
    if (!jobs || jobs.length === 0) {
      console.log('No jobs to process');
      return [];
    }
    
    console.log(`Processing ${jobs.length} jobs with batch size ${batchSize}`);
    const results: R[] = [];
    
    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(jobs.length/batchSize)}`);
      
      // Process all jobs in batch concurrently
      const batchPromises = batch.map((job, index) => {
        return new Promise<R>(async (resolve) => {
          try {
            console.log(`Processing job ${i + index + 1}/${jobs.length}`);
            const result = await processFunction(job);
            resolve(result);
          } catch (error) {
            console.error(`Error processing job:`, error);
            resolve(null as unknown as R);
          }
        });
      });
      
      // Wait for all jobs in the batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < jobs.length) {
        console.log("Waiting between batches...");
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
    /**
   * This method demonstrates how multithreading could be implemented
   * for CPU-intensive tasks in a real worker thread environment
   * 
   * Note: You would need to set up actual worker files to use this
   */
  async processWithRealThreads<T, R>(
    items: T[],
    workerScriptPath: string,
    batchSize: number = 3
  ): Promise<R[]> {
    const results: R[] = [];
    
    // Get CPU count safely
    let cpuCount = 4; // Default value
    try {
      const os = require('os');
      cpuCount = os.cpus().length;
    } catch (error) {
      this.logger.warn('Could not determine CPU count, using default: 4');
    }
    
    const maxWorkers = Math.min(cpuCount - 1, batchSize);
    
    // Process in batches using real worker threads
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map((item, index) => {
        return new Promise<R>((resolve, reject) => {
          // In a real implementation, you would create a worker
          // for each item in the batch, up to maxWorkers
          const worker = new Worker(workerScriptPath, {
            workerData: { item, index }
          });
          
          worker.on('message', (result) => {
            resolve(result);
          });
          
          worker.on('error', (err) => {
            reject(err);
          });
          
          worker.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        });
      });
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Error in worker thread batch:', error);
      }
      
      // Add a small delay between batches
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  /**
   * Run a worker thread for scraping jobs
   */
  async runWorker(workerType: 'naukri' | 'shine', params: any, mockData?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const workerPath = path.resolve(
        __dirname, 
        'workers', 
        `${workerType}-worker.js`
      );
      
      this.logger.log(`Starting ${workerType} worker thread from ${workerPath}`);
      
      try {
        const worker = new Worker(workerPath, {
          workerData: {
            params,
            mockData
          }
        });

        worker.on('message', (message) => {
          if (message.status === 'complete') {
            this.logger.log(`${workerType} worker completed in ${message.processingTime}ms`);
            resolve(message.data);
          } else if (message.status === 'error') {
            this.logger.error(`${workerType} worker error: ${message.error.message}`);
            reject(new Error(message.error.message));
          } else {
            this.logger.log(`${workerType} worker message: ${message.message}`);
          }
        });

        worker.on('error', (error) => {
          this.logger.error(`${workerType} worker thread error: ${error.message}`, error.stack);
          reject(error);
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            const errorMsg = `${workerType} worker stopped with exit code ${code}`;
            this.logger.error(errorMsg);
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        this.logger.error(`Failed to create ${workerType} worker: ${error.message}`, error.stack);
        reject(error);
      }
    });
  }

  /**
   * Run both Naukri and Shine workers in parallel
   */
  async runScraperWorkers(naukriParams: any, shineParams: any): Promise<[any, any]> {
    this.logger.log('Starting scraper workers for Naukri and Shine in parallel');
    
    try {
      const results = await Promise.all([
        this.runWorker('naukri', naukriParams),
        this.runWorker('shine', shineParams)
      ]);
      
      return results as [any, any];
    } catch (error) {
      this.logger.error(`Error running scraper workers: ${error.message}`, error.stack);
      throw error;
    }
  }
}
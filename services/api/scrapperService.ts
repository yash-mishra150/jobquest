import axios from 'axios';

// Types for the scraper API
interface ScrapperRequest {
  search: string;
  work_from_home?: boolean;
  useThreads?: boolean;
  page?: number;
  size?: number;
}

interface ScrapperResponse {
  success: boolean;
  message: string;
  data: JobData[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sources?: Record<string, unknown>;
}

interface JobData {
  title: string;
  link: string;
  companyName: string;
  location: string;
  experience: string;
  salary?: string;
  skills: string[];
  jobDescription: string;
  aboutCompany: string;
  postedDate: string;
  source: string;
  timestamp?: string;
  jobType?: string;
  numberOfOpenings?: string;
  industry?: string;
  recruiter?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: '/api/jobs',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scrapperService = {
  searchJobs: async (params: ScrapperRequest): Promise<ScrapperResponse> => {
    const response = await api.post('/scrapper', params);
    return response.data;
  },
  
  getFeaturedJobs: async (): Promise<ScrapperResponse> => {
    const response = await api.get('/featured');
    return response.data;
  },
};

export default scrapperService;
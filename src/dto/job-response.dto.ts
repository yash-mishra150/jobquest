export interface JobDto {
  title: string;
  link: string;
  companyName: string;
  location: string;
  experience: string;
  salary: string;
  skills: string[];
  jobDescription: string;
  aboutCompany: string;
  postedDate: string;
  source: string;
  timestamp: string;
}

export interface JobResponseDto {
  success: boolean;
  message: string;
  data: JobDto[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  sources?: {
    timesjobs?: {
      count: number;
      total: number;
      requested: number;
    };
    shine?: {
      count: number;
      total: number;
      requested: number;
    };
  };
}

import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

enum UserType {
  Candidate = 'Candidate',
  Employer = 'Employer'
}

interface BaseRegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  userType: UserType;
}

interface CandidateRegisterData extends BaseRegisterData {
  userType: UserType.Candidate;
  candidateType?: string;
  preferredJobType?: string;
  preferredWorkMode?: string;
  locationPreferences?: string[];
  skills?: string[];
  expectedSalaryRange?: { min: number; max: number };
  resume?: string;
}

interface EmployerRegisterData extends BaseRegisterData {
  userType: UserType.Employer;
  companyName?: string;
  companyDescription?: string;
  companySize?: string;
  companyWebsite?: string;
  industry?: string;
  companyLocation?: string;
}

// Union type for registration data
type RegisterData = CandidateRegisterData | EmployerRegisterData;

interface AuthResponse {
  message?: string;
  success?: boolean;
  error?: string;
  role?: string;
  name?: string;
}

/**
 * Login function that uses Next.js API route
 * Only returns minimal information (success/message) from the API
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await axios.post('/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = response.data;
    
    if (response.status >= 400) {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }
      return {
      success: data.success || true,
      message: data.message || 'Login successful',
      role: data.role || null
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login',
    };
  }
}

/**
 * Register function that uses Next.js API route
 * Only returns minimal information (message) from the API
 */
export async function register(userData: RegisterData): Promise<AuthResponse> {
  try {
    const response = await axios.post('/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = response.data;
    
    if (response.status >= 400) {
      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    }
    
    return {
      success: true,
      message: data.message || 'Registration successful',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration',
    };
  }
}


export async function logout(): Promise<boolean> {
  try {
    const response = await axios.post('/api/auth/logout');
    
    return response.status === 200;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
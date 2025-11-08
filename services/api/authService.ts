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

    // Normalize success/role/name to expected types (avoid null)
    const success = typeof data.success === 'boolean' ? data.success : response.status === 200;
    const role = typeof data.role === 'string' ? data.role : undefined;
    const name = typeof data.name === 'string' ? data.name : undefined;

    return {
      success,
      message: data.message || 'Login successful',
      role,
      name
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message;
    
    let formattedMessage;
    if (Array.isArray(errorMessage)) {
      formattedMessage = errorMessage[0];
    } else {
      formattedMessage = errorMessage || 'An error occurred during login';
    }
    
    return {
      success: false,
      message: formattedMessage,
    };
  }
}

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
    
    const errorMessage = (error as any)?.response?.data?.message;
    
    // Handle array of error messages - show only the first one
    let formattedMessage;
    if (Array.isArray(errorMessage)) {
      formattedMessage = errorMessage[0];
    } else {
      formattedMessage = errorMessage || 'An error occurred during registration';
    }
    
    return {
      success: false,
      message: formattedMessage,
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
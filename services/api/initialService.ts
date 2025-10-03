import axios from 'axios';

interface ValidityResponse {
  valid: boolean;
  role?: string | null;
  userType?: string | null;
  name?: string | null;
}

/**
 * Checks if the API is valid and available
 * This also validates if the user's session is still valid
 * 
 * @param options.detailed - When true, returns a ValidityResponse object. When false, returns just a boolean
 * @returns {ValidityResponse | boolean} - Either a ValidityResponse object or a boolean depending on options
 */
export async function checkValidity(options: { detailed?: boolean } = {}): Promise<ValidityResponse | boolean> {
  try {
    const response = await axios.get('/api/valid-initial', {
      withCredentials: true // Ensure cookies are sent with the request
    });

    // Return either a detailed response or just a boolean based on options
    return options.detailed
      ? { valid: response.data.valid === true, role: response.data.role || null, userType: response.data.userType || null, name: response.data.name || null }
      : response.data.valid === true;
  } catch (error) {
    // If we get a 401 error, the session is invalid
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Session expired or unauthorized');
      return options.detailed ? { valid: false } : false;
    }

    console.error('API validity check error:', error);
    return options.detailed ? { valid: false } : false;
  }
}

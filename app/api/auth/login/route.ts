import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiBase = process.env.API_BASE;

    // Make sure to include credentials to receive cookies from the backend    
    const response = await axios({
      method: 'post',
      url: `${apiBase}/auth/login`,
      data: body,
      withCredentials: true
    });
    
    const { role, message } = response.data;
    console.log('Login response:', response.data);
      // Get the cookies from the backend response
    const backendCookies = response.headers['set-cookie'];
    console.log('Backend cookies:', backendCookies);
    
    // Create response headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    });
    
    // Add the cookies from the backend to our response headers
    // This is crucial for authentication to work correctly
    if (backendCookies && backendCookies.length > 0) {
      backendCookies.forEach(cookie => {
        headers.append('Set-Cookie', cookie);
      });
    }
    
    // Create and return the response
    return NextResponse.json(
      {
        success: response.status === 200 || response.status === 201,
        role: role || null,
        message: message || 'Login successful'
      },
      {
        status: response.status,
        headers: headers
      }
    );  } catch (error) {
    console.error('Login error:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Login failed';

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

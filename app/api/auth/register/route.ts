import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiBase = process.env.API_BASE;
    
    const response = await axios({
      method: 'post',
      url: `${apiBase}/auth/register`,
      data: body,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
    
    // Extract only the message from the response
    const { message } = response.data;
    
    // Return only success/failure status to client - nothing else
    // This minimizes visible data in network requests
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    
    return NextResponse.json(
      { message: message || 'Registration successful' }, 
      { 
        status: response.status,
        headers: headers
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Registration failed';
      
      return NextResponse.json({ message }, { status });
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

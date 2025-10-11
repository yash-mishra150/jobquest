import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const apiBase = process.env.API_BASE;
    
    const cookieHeader = req.headers.get('cookie');
    
    await axios({
      method: 'post',
      url: `${apiBase}/auth/logout`,
      headers: {
        Cookie: cookieHeader || ''
      },
      withCredentials: true
    });
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    
    headers.append('Set-Cookie', 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    headers.append('Set-Cookie', 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Logged out successfully'
      }, 
      { 
        status: 200,
        headers: headers
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Logout failed';
      
      return NextResponse.json({ message }, { status });
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
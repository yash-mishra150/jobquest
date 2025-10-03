import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    try {
        const apiBase = process.env.API_BASE;

        // Get cookies from the request to send to the backend
        const cookieHeader = req.headers.get('cookie');

        // Call the backend validation endpoint with cookies
        const response = await axios({
            method: 'get',
            url: `${apiBase}/auth/validate-session`,
            headers: {
                // Forward the cookies from the client request to the backend
                Cookie: cookieHeader || ''
            },
            withCredentials: true // Important for cookies to be sent/received
        });
        return NextResponse.json(
            {
                valid: response.status === 200 || response.status === 201,
                role: response.data.role || null,
                userType: response.data.userType || null,
                name: response.data.name || null
            },
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error('Validation error:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            return NextResponse.json({ valid: false }, { status });
        }

        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    try {
        const response = await axios.get(`${process.env.API_BASE}/jobs/get`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
            },
        });
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Get Jobs API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

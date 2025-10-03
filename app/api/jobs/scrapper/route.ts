import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        // Get request body
        const body = await request.json();

        // Make request to external scraper service using axios
        const scrapperResponse = await axios.post(`${process.env.API_BASE}/scrapper/combined`, body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Return the response
        return NextResponse.json(scrapperResponse.data);

    } catch (error) {
        console.error('Scrapper API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


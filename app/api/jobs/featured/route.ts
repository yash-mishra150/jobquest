import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const featuredResponse = await axios.get(`${process.env.API_BASE}/scrapper/featured`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(featuredResponse.data);

    } catch (error) {
        console.error('Featured jobs API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
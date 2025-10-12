import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const raw = await request.json();

        // Whitelist and coerce only the expected fields for the ML service
        const body = {
            title: String(raw?.title ?? ''),
            link: String(raw?.link ?? ''),
            companyName: String(raw?.companyName ?? ''),
            location: String(raw?.location ?? ''),
            duration: String(raw?.duration ?? ''),
            stipend: String(raw?.stipend ?? ''),
            earlyApplicant: Boolean(raw?.earlyApplicant ?? false),
            skills: Array.isArray(raw?.skills) ? raw.skills.map((s: any) => String(s)) : [],
            jobDescription: String(raw?.jobDescription ?? ''),
            aboutCompany: String(raw?.aboutCompany ?? ''),
            numberOfOpenings: String(raw?.numberOfOpenings ?? ''),
            timestamp: ((): string => {
                try {
                    const d = new Date(raw?.timestamp ?? new Date().toISOString());
                    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
                } catch {
                    return new Date().toISOString();
                }
            })(),
        };

        const cookieHeader = request.headers.get('cookie');

        const scrapperResponse = await axios.post(`${process.env.API_BASE}/machine-learning/jobVerify`, body, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader || '',
            },
        });

        return NextResponse.json(scrapperResponse.data);

    } catch (error) {
        console.error('Scrapper API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

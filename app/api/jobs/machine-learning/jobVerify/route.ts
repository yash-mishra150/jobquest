import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const raw = await request.json();

        // Whitelist and coerce only the expected fields for the ML service
        const body: any = {
            title: String(raw?.title ?? ''),
        };

        // Optional fields - only include if present
        if (raw?.company_profile) body.company_profile = String(raw.company_profile);
        if (raw?.description) body.description = String(raw.description);
        
        if (raw?.requirements) {
            if (Array.isArray(raw.requirements)) {
                body.requirements = raw.requirements.map((r: any) => String(r));
            } else {
                body.requirements = String(raw.requirements);
            }
        }
        
        if (raw?.required_experience) body.required_experience = String(raw.required_experience);
        if (raw?.required_education) body.required_education = String(raw.required_education);
        if (raw?.benefits) body.benefits = String(raw.benefits);
        if (raw?.salary) body.salary = String(raw.salary);
        if (raw?.workMode) body.workMode = String(raw.workMode);

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

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const raw = await request.json();
        const body = {
            title: String(raw?.title ?? ''),
            workMode: String(raw?.workMode ?? ''),
            skills: Array.isArray(raw?.skills) ? raw.skills.map((s: any) => String(s)) : [],
            experienceNeeded: Number(raw?.experienceNeeded ?? 0),
            salary: String(raw?.salary ?? ''),
            description: String(raw?.description ?? ''),
        };
        const response = await axios.post(`${process.env.API_BASE}/jobs/create`, body, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
            },
        });
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Create Job API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

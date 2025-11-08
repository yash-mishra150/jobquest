import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function PUT(request: NextRequest, context: any) {
  const id = context?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

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

    const response = await axios.put(`${process.env.API_BASE}/jobs/update/${id}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Update Job API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function DELETE(request: NextRequest, context: any) {
  const params = context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const response = await axios.delete(`${process.env.API_BASE}/jobs/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Delete Job API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

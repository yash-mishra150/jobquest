import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const response = await axios.delete(`${process.env.API_BASE}/jobs/delete/${params.id}`, {
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

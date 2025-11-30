import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    console.log('TEST: Creating simple mindmap');
    try {
        const simple = await prisma.mindmap.create({
            data: {
                clubId: 'test-club',
                title: 'Simple Test',
                description: 'Test description',
                createdBy: 'test-user',
                viewportX: 0,
                viewportY: 0,
                viewportZoom: 1,
            },
        });

        console.log('TEST: Success!', simple);
        return NextResponse.json({ success: true, mindmap: simple });
    } catch (error: any) {
        console.error('TEST: Error', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
                content: '# Simple Test\n\n## Main Idea\n- Task 1\n- Task 2',
                createdBy: 'test-user',
            },
        });

        console.log('TEST: Success!', simple);
        return NextResponse.json({ success: true, mindmap: simple });
    } catch (error: any) {
        console.error('TEST: Error', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

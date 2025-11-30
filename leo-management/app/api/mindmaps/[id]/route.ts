import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';

function verifyToken(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; clubId: string };
    } catch {
        return null;
    }
}

// GET - Retrieve a specific mindmap
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const mindmap = await prisma.mindmap.findUnique({
            where: { id },
        });

        if (!mindmap) {
            return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 });
        }

        // Check if user has access (same club)
        if (mindmap.clubId !== user.clubId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ mindmap });
    } catch (error) {
        console.error('Error fetching mindmap:', error);
        return NextResponse.json({ error: 'Failed to fetch mindmap' }, { status: 500 });
    }
}

// PUT - Update a mindmap
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { title, description, content } = data;

        const existingMindmap = await prisma.mindmap.findUnique({
            where: { id },
        });

        if (!existingMindmap) {
            return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 });
        }

        if (existingMindmap.clubId !== user.clubId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const mindmap = await prisma.mindmap.update({
            where: { id },
            data: {
                title,
                description,
                content,
            },
        });

        return NextResponse.json({ mindmap });
    } catch (error) {
        console.error('Error updating mindmap:', error);
        return NextResponse.json({ error: 'Failed to update mindmap' }, { status: 500 });
    }
}

// DELETE - Delete a mindmap
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const existingMindmap = await prisma.mindmap.findUnique({
            where: { id },
        });

        if (!existingMindmap) {
            return NextResponse.json({ error: 'Mindmap not found' }, { status: 404 });
        }

        if (existingMindmap.clubId !== user.clubId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.mindmap.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting mindmap:', error);
        return NextResponse.json({ error: 'Failed to delete mindmap' }, { status: 500 });
    }
}

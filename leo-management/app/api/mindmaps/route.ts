import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient(); // Removed local instantiation
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';

// Helper to verify JWT token
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

// GET - List all mindmaps for the user's club
export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');

        const where: any = { clubId: user.clubId };
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;

        const mindmaps = await prisma.mindmap.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ mindmaps });
    } catch (error) {
        console.error('Error fetching mindmaps:', error);
        return NextResponse.json({ error: 'Failed to fetch mindmaps' }, { status: 500 });
    }
}

// POST - Create a new mindmap
export async function POST(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, entityType, entityId, content } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Default content if none provided
        const defaultContent = `# ${title}\n\n## Main Idea\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3`;

        const mindmap = await prisma.mindmap.create({
            data: {
                clubId: user.clubId,
                title,
                description,
                entityType,
                entityId,
                content: content || defaultContent,
                createdBy: user.userId,
            },
        });

        return NextResponse.json({ mindmap }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating mindmap:', error);
        return NextResponse.json({
            error: 'Failed to create mindmap',
            details: error.message
        }, { status: 500 });
    }
}

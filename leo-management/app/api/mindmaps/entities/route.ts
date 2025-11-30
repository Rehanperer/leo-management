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

// GET - Get all entities (projects, meetings, events) for dropdown
export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [projects, meetings, events] = await Promise.all([
            prisma.project.findMany({
                where: { clubId: user.clubId },
                select: { id: true, title: true, date: true, status: true },
                orderBy: { date: 'desc' },
            }),
            prisma.meeting.findMany({
                where: { clubId: user.clubId },
                select: { id: true, title: true, date: true, status: true },
                orderBy: { date: 'desc' },
            }),
            prisma.event.findMany({
                where: { clubId: user.clubId },
                select: { id: true, title: true, startDate: true, status: true },
                orderBy: { startDate: 'desc' },
            }),
        ]);

        return NextResponse.json({
            entities: {
                projects: projects.map(p => ({ ...p, type: 'project' })),
                meetings: meetings.map(m => ({ ...m, type: 'meeting' })),
                events: events.map(e => ({ ...e, date: e.startDate, type: 'event' })),
            },
        });
    } catch (error) {
        console.error('Error fetching entities:', error);
        return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
    }
}

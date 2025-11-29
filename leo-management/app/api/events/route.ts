import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const { searchParams } = new URL(request.url);
            const type = searchParams.get('type');
            const status = searchParams.get('status');
            const highlight = searchParams.get('highlight');

            let where: any = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            if (type && type !== 'All') where.type = type;
            if (status && status !== 'All') where.status = status;
            if (highlight === 'true') where.highlight = true;

            const events = await prisma.event.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                },
                orderBy: { startDate: 'asc' }, // Chronological order
            });

            return NextResponse.json({ events });
        } catch (error) {
            console.error('Get events error:', error);
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }
    });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const {
                title, description, startDate, endDate, venue, status,
                type, startTime, endTime, goals, impactMetrics,
                collaborators, documents, highlight, mood, participants
            } = body;

            if (!title || !startDate) {
                return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
            }

            const clubId = auth.role === 'admin' ? body.clubId : auth.clubId;

            const event = await prisma.event.create({
                data: {
                    clubId: clubId!,
                    title,
                    description,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : undefined,
                    venue,
                    status: status || 'planned',
                    type: type || 'General',
                    startTime,
                    endTime,
                    goals: goals ? JSON.stringify(goals) : undefined,
                    impactMetrics: impactMetrics ? JSON.stringify(impactMetrics) : undefined,
                    collaborators: collaborators ? JSON.stringify(collaborators) : undefined,
                    documents: documents ? JSON.stringify(documents) : undefined,
                    highlight: highlight || false,
                    mood,
                    participants: participants ? parseInt(participants) : undefined,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ event });
        } catch (error) {
            console.error('Create event error:', error);
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
        }
    });
}

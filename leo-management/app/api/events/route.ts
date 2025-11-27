import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const where = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            const events = await prisma.event.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                },
                orderBy: { startDate: 'desc' },
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
            const { title, description, startDate, endDate, venue, status, participants } = body;

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
                    status,
                    participants: participants ? parseInt(participants) : undefined,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ event });
        } catch (error) {
            console.error('Create event error:', error);
            return NextResponse.json({ error: ' to create event' }, { status: 500 });
        }
    });
}

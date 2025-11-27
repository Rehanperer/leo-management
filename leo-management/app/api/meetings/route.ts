import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const where = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            const meetings = await prisma.meeting.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                },
                orderBy: { date: 'desc' },
            });

            return NextResponse.json({ meetings });
        } catch (error) {
            console.error('Get meetings error:', error);
            return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
        }
    });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { title, date, venue, agenda, minutes, attendees } = body;

            if (!title || !date) {
                return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
            }

            const clubId = auth.role === 'admin' ? body.clubId : auth.clubId;

            const meeting = await prisma.meeting.create({
                data: {
                    clubId: clubId!,
                    title,
                    date: new Date(date),
                    venue,
                    agenda,
                    minutes,
                    attendees: attendees ? JSON.stringify(attendees) : undefined,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ meeting });
        } catch (error) {
            console.error('Create meeting error:', error);
            return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
        }
    });
}

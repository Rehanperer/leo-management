import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const { searchParams } = new URL(req.url);
            const type = searchParams.get('type');
            const projectId = searchParams.get('projectId');
            const status = searchParams.get('status');

            const where: any = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            if (type && type !== 'all') where.type = type;
            if (projectId && projectId !== 'all') where.projectId = projectId;
            if (status && status !== 'all') where.status = status;

            const meetings = await prisma.meeting.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                    project: { select: { title: true } },
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
            const {
                title, date, startTime, endTime, venue, type, status,
                summary, agenda, minutes, attendees, documents, actionItems, projectId
            } = body;

            if (!title || !date) {
                return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
            }

            const clubId = auth.role === 'admin' ? body.clubId : auth.clubId;

            if (!clubId) {
                return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
            }

            const meeting = await prisma.meeting.create({
                data: {
                    clubId: clubId!,
                    title,
                    date: new Date(date),
                    startTime,
                    endTime,
                    venue,
                    type: type || 'General',
                    status: status || 'scheduled',
                    summary,
                    agenda: agenda ? JSON.stringify(agenda) : undefined,
                    minutes,
                    attendees: attendees ? JSON.stringify(attendees) : undefined,
                    documents: documents ? JSON.stringify(documents) : undefined,
                    actionItems: actionItems ? JSON.stringify(actionItems) : undefined,
                    projectId: projectId || null,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ meeting });
        } catch (error: any) {
            console.error('Create meeting error:', error);
            return NextResponse.json({ error: error.message || 'Failed to create meeting' }, { status: 500 });
        }
    });
}

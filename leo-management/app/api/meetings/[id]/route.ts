import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(request, async (req, auth) => {
        try {
            const { id } = await params;
            const meeting = await prisma.meeting.findUnique({
                where: { id },
                include: {
                    club: { select: { name: true } },
                    project: { select: { title: true } },
                    user: { select: { username: true } },
                },
            });

            if (!meeting) {
                return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
            }

            // Check access
            if (auth.role !== 'admin' && meeting.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            return NextResponse.json({ meeting });
        } catch (error) {
            console.error('Get meeting error:', error);
            return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
        }
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(request, async (req, auth) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const {
                title, date, startTime, endTime, venue, type, status,
                summary, agenda, minutes, attendees, documents, actionItems, projectId
            } = body;

            const meeting = await prisma.meeting.findUnique({
                where: { id },
            });

            if (!meeting) {
                return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
            }

            if (auth.role !== 'admin' && meeting.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const updatedMeeting = await prisma.meeting.update({
                where: { id },
                data: {
                    title,
                    date: date ? new Date(date) : undefined,
                    startTime,
                    endTime,
                    venue,
                    type,
                    status,
                    summary,
                    agenda: agenda ? (typeof agenda === 'string' ? agenda : JSON.stringify(agenda)) : undefined,
                    minutes,
                    attendees: attendees ? (typeof attendees === 'string' ? attendees : JSON.stringify(attendees)) : undefined,
                    documents: documents ? (typeof documents === 'string' ? documents : JSON.stringify(documents)) : undefined,
                    actionItems: actionItems ? (typeof actionItems === 'string' ? actionItems : JSON.stringify(actionItems)) : undefined,
                    projectId: projectId || null,
                },
            });

            return NextResponse.json({ meeting: updatedMeeting });
        } catch (error) {
            console.error('Update meeting error:', error);
            return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAuth(request, async (req, auth) => {
        try {
            const { id } = await params;
            const meeting = await prisma.meeting.findUnique({
                where: { id },
            });

            if (!meeting) {
                return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
            }

            if (auth.role !== 'admin' && meeting.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            await prisma.meeting.delete({
                where: { id },
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('Delete meeting error:', error);
            return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
        }
    });
}

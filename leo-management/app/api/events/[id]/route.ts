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
            const event = await prisma.event.findUnique({
                where: { id },
                include: {
                    club: { select: { name: true } },
                },
            });

            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            // Check access rights if needed (e.g., only own club)
            if (auth.role !== 'admin' && event.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            return NextResponse.json({ event });
        } catch (error) {
            console.error('Get event error:', error);
            return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
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
                title, description, startDate, endDate, venue, status,
                type, startTime, endTime, goals, impactMetrics,
                collaborators, documents, highlight, mood, participants
            } = body;

            const event = await prisma.event.findUnique({
                where: { id },
            });

            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            if (auth.role !== 'admin' && event.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const updatedEvent = await prisma.event.update({
                where: { id },
                data: {
                    title,
                    description,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    venue,
                    status,
                    type,
                    startTime,
                    endTime,
                    goals: goals ? JSON.stringify(goals) : undefined,
                    impactMetrics: impactMetrics ? JSON.stringify(impactMetrics) : undefined,
                    collaborators: collaborators ? JSON.stringify(collaborators) : undefined,
                    documents: documents ? JSON.stringify(documents) : undefined,
                    highlight,
                    mood,
                    participants: participants ? parseInt(participants) : undefined,
                },
            });

            return NextResponse.json({ event: updatedEvent });
        } catch (error) {
            console.error('Update event error:', error);
            return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
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
            const event = await prisma.event.findUnique({
                where: { id },
            });

            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            if (auth.role !== 'admin' && event.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            await prisma.event.delete({
                where: { id },
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('Delete event error:', error);
            return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
        }
    });
}

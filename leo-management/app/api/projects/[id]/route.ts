import { NextRequest, NextResponse } from 'next/server';
import { withAuth, checkClubAccess } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return withAuth(request, async (req, auth) => {
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include: {
                    club: { select: { name: true } },
                    user: { select: { username: true } },
                    financialRecords: true,
                },
            });

            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            if (!checkClubAccess(auth, project.clubId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            return NextResponse.json({ project });
        } catch (error) {
            console.error('Get project error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch project' },
                { status: 500 }
            );
        }
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return withAuth(request, async (req, auth) => {
        try {
            const existing = await prisma.project.findUnique({ where: { id } });

            if (!existing) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            if (!checkClubAccess(auth, existing.clubId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const body = await req.json();
            const project = await prisma.project.update({
                where: { id },
                data: {
                    ...body,
                    date: body.date ? new Date(body.date) : undefined,
                    photos: body.photos ? JSON.stringify(body.photos) : undefined,
                    documents: body.documents ? JSON.stringify(body.documents) : undefined,
                },
                include: {
                    club: { select: { name: true } },
                    user: { select: { username: true } },
                },
            });

            return NextResponse.json({ project });
        } catch (error) {
            console.error('Update project error:', error);
            return NextResponse.json(
                { error: 'Failed to update project' },
                { status: 500 }
            );
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return withAuth(request, async (req, auth) => {
        try {
            const existing = await prisma.project.findUnique({ where: { id } });

            if (!existing) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            if (!checkClubAccess(auth, existing.clubId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            await prisma.project.delete({ where: { id } });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('Delete project error:', error);
            return NextResponse.json(
                { error: 'Failed to delete project' },
                { status: 500 }
            );
        }
    });
}

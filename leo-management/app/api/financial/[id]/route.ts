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
            const record = await prisma.financialRecord.findUnique({
                where: { id },
                include: {
                    project: { select: { title: true } }
                }
            });

            if (!record) {
                return NextResponse.json({ error: 'Record not found' }, { status: 404 });
            }

            // Check access
            if (record.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            return NextResponse.json({ record });
        } catch (error) {
            console.error('Get financial record error:', error);
            return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
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
            const record = await prisma.financialRecord.findUnique({
                where: { id },
            });

            if (!record) {
                return NextResponse.json({ error: 'Record not found' }, { status: 404 });
            }

            // Check access
            if (record.clubId !== auth.clubId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            await prisma.financialRecord.delete({
                where: { id },
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('Delete financial record error:', error);
            return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
        }
    });
}

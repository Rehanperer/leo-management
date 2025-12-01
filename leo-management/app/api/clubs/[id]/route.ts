import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure user belongs to the club they are trying to update
        if (auth.clubId !== id && auth.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, district } = body;

        // Update club
        const updatedClub = await prisma.club.update({
            where: { id },
            data: {
                name,
                district
            }
        });

        return NextResponse.json(updatedClub);
    } catch (error) {
        console.error('Error updating club:', error);
        return NextResponse.json(
            { error: 'Failed to update club details' },
            { status: 500 }
        );
    }
}

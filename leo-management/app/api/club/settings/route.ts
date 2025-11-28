import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            // Verify admin role
            const user = await prisma.user.findUnique({
                where: { id: auth.userId },
            });

            if (!user || user.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }

            const { clubName, district } = await req.json();

            if (!auth.clubId) {
                return NextResponse.json({ error: 'User is not associated with a club' }, { status: 400 });
            }

            await prisma.club.update({
                where: { id: auth.clubId },
                data: { name: clubName },
            });

            return NextResponse.json({ message: 'Club settings updated successfully' });
        } catch (error) {
            console.error('Error updating club settings:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

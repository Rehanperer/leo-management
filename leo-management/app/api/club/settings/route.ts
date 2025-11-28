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

            // In a real app, we might have a separate Club model.
            // For now, we'll update the admin's clubName as a proxy for the system setting,
            // or just return success since we don't have a Club table yet.
            // Let's assume we update the user's clubName for now.

            await prisma.user.update({
                where: { id: auth.userId },
                data: { clubName },
            });

            return NextResponse.json({ message: 'Club settings updated successfully' });
        } catch (error) {
            console.error('Error updating club settings:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

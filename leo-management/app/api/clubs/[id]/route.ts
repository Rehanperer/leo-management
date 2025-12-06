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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyAuth(request);

        // 1. Verify Admin Session
        if (!auth || auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // 2. Verify Admin Password
        // Need to import comparePassword (or verifyPassword) and get admin user
        const { verifyPassword } = await import('@/lib/auth');

        const adminUser = await prisma.user.findUnique({
            where: { id: auth.userId }
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        const isValid = await verifyPassword(password, adminUser.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // 3. Delete Club
        // Prisma transaction to ensure clean delete if needed, but cascade delete in DB usually handles relations.
        // If relations are not set to cascade in schema, we might need to delete related records first.
        // Assuming schema handles cascade or we force it:

        // Delete all users associated with this club first to be safe (if not cascaded)
        await prisma.user.deleteMany({
            where: { clubId: id }
        });

        await prisma.club.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Club account deleted successfully' });

    } catch (error) {
        console.error('Error deleting club:', error);
        return NextResponse.json(
            { error: 'Failed to delete club' },
            { status: 500 }
        );
    }
}

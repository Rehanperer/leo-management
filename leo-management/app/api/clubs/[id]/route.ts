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
        const { verifyPassword } = await import('@/lib/auth');

        const adminUser = await prisma.user.findUnique({
            where: { id: auth.userId }
        });

        if (!adminUser) {
            console.error('Admin user not found for ID:', auth.userId);
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        const isValid = await verifyPassword(password, adminUser.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // 3. Delete Club & All Related Data
        // Since we don't have onDelete: Cascade in the schema for all types, we must delete manually in order.

        await prisma.$transaction(async (tx) => {
            // 1. Delete items that rely on Project/Club/User
            await tx.financialRecord.deleteMany({ where: { clubId: id } });
            await tx.meeting.deleteMany({ where: { clubId: id } });
            await tx.event.deleteMany({ where: { clubId: id } });
            await tx.document.deleteMany({ where: { clubId: id } });
            await tx.mindmap.deleteMany({ where: { clubId: id } });

            // 2. Delete Projects (must be done after Finance/Meetings as they might reference projects)
            await tx.project.deleteMany({ where: { clubId: id } });

            // 3. Delete Chat History (attached to Users)
            const clubUsers = await tx.user.findMany({ where: { clubId: id }, select: { id: true } });
            const userIds = clubUsers.map(u => u.id);
            if (userIds.length > 0) {
                await tx.aIChatHistory.deleteMany({ where: { userId: { in: userIds } } });
            }

            // 4. Delete Users (must be done after everything else createdBy them is gone? 
            // Actually, if we delete the records above (Project, Event, etc), the createdBy reference is gone with the record)
            await tx.user.deleteMany({ where: { clubId: id } });

            // 5. Delete Club
            await tx.club.delete({ where: { id } });
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

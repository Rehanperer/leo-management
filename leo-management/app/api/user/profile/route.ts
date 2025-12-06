import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { profilePicture, canCreateClubs } = body;

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: auth.userId },
            data: {
                profilePicture,
                ...(typeof canCreateClubs === 'boolean' ? { canCreateClubs } : {}),
            },
            include: {
                club: true
            }
        });

        // Return updated user data formatted for the frontend
        return NextResponse.json({
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                clubId: updatedUser.clubId,
                clubName: updatedUser.club?.name,
                profilePicture: updatedUser.profilePicture,
                canCreateClubs: updatedUser.canCreateClubs,
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const { currentPassword, newPassword } = await req.json();

            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { error: 'Current and new passwords are required' },
                    { status: 400 }
                );
            }

            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'New password must be at least 6 characters long' },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: auth.userId },
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);

            if (!isValid) {
                return NextResponse.json(
                    { error: 'Incorrect current password' },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: auth.userId },
                data: { password: hashedPassword },
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('Change password error:', error);
            return NextResponse.json(
                { error: 'Failed to change password' },
                { status: 500 }
            );
        }
    });
}

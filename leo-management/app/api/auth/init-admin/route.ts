import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Create first admin user (only works if no users exist)
 */
export async function POST(request: NextRequest) {
    try {
        // Check if any users exist
        const userCount = await prisma.user.count();

        if (userCount > 0) {
            return NextResponse.json(
                { error: 'Admin user already exists' },
                { status: 409 }
            );
        }

        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const admin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'admin',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Admin user created successfully',
            username: admin.username,
        });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generatePassword, verifyToken } from '@/lib/auth';

/**
 * Register a new club account (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin token
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch user to check permissions
        const adminUser = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!adminUser?.canCreateClubs) {
            return NextResponse.json({ error: 'Club creation is disabled. Please enable it in Settings.' }, { status: 403 });
        }

        const body = await request.json();
        const { clubName, contactEmail, username } = body;

        if (!clubName || !username) {
            return NextResponse.json(
                { error: 'Club name and username are required' },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Generate club code from name
        const clubCode = clubName.replace(/\s+/g, '-').toLowerCase();

        // Generate random password
        const generatedPassword = generatePassword();
        const hashedPassword = await hashPassword(generatedPassword);

        // Create club
        const club = await prisma.club.create({
            data: {
                name: clubName,
                code: clubCode,
                contactEmail,
            },
        });

        // Create user for the club
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'club',
                clubId: club.id,
            },
        });

        return NextResponse.json({
            success: true,
            club: {
                id: club.id,
                name: club.name,
                code: club.code,
            },
            credentials: {
                username: user.username,
                password: generatedPassword, // Return plaintext password once
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Club or username already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth || auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clubs = await prisma.club.findMany({
            include: {
                users: {
                    select: {
                        username: true
                    },
                    where: {
                        role: 'club' // Get the club account username
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedClubs = clubs.map(club => ({
            id: club.id,
            name: club.name,
            code: club.code,
            district: club.district,
            username: club.users[0]?.username || 'N/A',
            active: club.active,
            createdAt: club.createdAt
        }));

        return NextResponse.json({ clubs: formattedClubs });
    } catch (error) {
        console.error('Error fetching clubs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clubs' },
            { status: 500 }
        );
    }
}

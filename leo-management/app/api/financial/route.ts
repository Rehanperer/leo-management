import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const { searchParams } = new URL(req.url);
            const type = searchParams.get('type');
            const status = searchParams.get('status');
            const projectId = searchParams.get('projectId');
            const month = searchParams.get('month');

            const where: any = {
                clubId: auth.clubId,
            };

            if (type && type !== 'all') where.type = type;
            if (status && status !== 'all') where.status = status;
            if (projectId) where.projectId = projectId;

            if (month && month !== 'all') {
                const year = new Date().getFullYear(); // Default to current year for now
                const startDate = new Date(year, parseInt(month) - 1, 1);
                const endDate = new Date(year, parseInt(month), 0);
                where.date = {
                    gte: startDate,
                    lte: endDate,
                };
            }

            const records = await prisma.financialRecord.findMany({
                where,
                include: {
                    project: {
                        select: { title: true }
                    }
                },
                orderBy: { date: 'desc' },
            });

            return NextResponse.json({ records });
        } catch (error) {
            console.error('Error fetching financial records:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return NextResponse.json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { type, status, category, amount, description, date, projectId, receipt } = body;

            if (!type || !category || !amount || !date) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }

            if (!auth.clubId) {
                return NextResponse.json({ error: 'User not associated with a club' }, { status: 400 });
            }

            const record = await prisma.financialRecord.create({
                data: {
                    clubId: auth.clubId,
                    type,
                    status: status || 'completed',
                    category,
                    amount,
                    description,
                    date: new Date(date),
                    projectId: projectId || null,
                    receiptUrl: receipt, // Storing base64 directly for now
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ record });
        } catch (error) {
            console.error('Error creating financial record:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}

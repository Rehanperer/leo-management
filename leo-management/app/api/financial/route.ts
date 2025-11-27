import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const where = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            const records = await prisma.financialRecord.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                    project: { select: { title: true } },
                },
                orderBy: { date: 'desc' },
            });

            return NextResponse.json({ records });
        } catch (error) {
            console.error('Get financial records error:', error);
            return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
        }
    });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { type, category, amount, description, date, receiptUrl, projectId } = body;

            if (!type || !category || !amount || !date) {
                return NextResponse.json(
                    { error: 'Type, category, amount, and date are required' },
                    { status: 400 }
                );
            }

            const clubId = auth.role === 'admin' ? body.clubId : auth.clubId;

            const record = await prisma.financialRecord.create({
                data: {
                    clubId: clubId!,
                    projectId,
                    type,
                    category,
                    amount: parseFloat(amount),
                    description,
                    date: new Date(date),
                    receiptUrl,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ record });
        } catch (error) {
            console.error('Create financial record error:', error);
            return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
        }
    });
}

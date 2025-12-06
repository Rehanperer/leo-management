import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const where = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            const [
                projectCount,
                meetingCount,
                eventCount,
                financialRecords,
                completedProjects
            ] = await Promise.all([
                prisma.project.count({ where }),
                prisma.meeting.count({ where }),
                prisma.event.count({ where }),
                prisma.financialRecord.findMany({
                    where,
                    select: { type: true, amount: true }
                }),
                prisma.project.findMany({
                    where: { ...where, status: 'completed' },
                    select: { serviceHours: true, beneficiaries: true }
                })
            ]);

            const budgetBalance = financialRecords.reduce((acc, record) => {
                return record.type === 'income'
                    ? acc + record.amount
                    : acc - record.amount;
            }, 0);

            const totalServiceHours = completedProjects.reduce((acc, project) => acc + (project.serviceHours || 0), 0);
            const totalBeneficiaries = completedProjects.reduce((acc, project) => acc + (project.beneficiaries || 0), 0);
            const totalProjectsCompleted = completedProjects.length;

            return NextResponse.json({
                stats: {
                    projects: projectCount,
                    meetings: meetingCount,
                    events: eventCount,
                    budget: budgetBalance,
                    totalProjectsCompleted,
                    totalServiceHours,
                    totalBeneficiaries
                }
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch dashboard stats' },
                { status: 500 }
            );
        }
    });
}

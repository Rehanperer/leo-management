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
                completedProjects,
                upcomingEvents,
                upcomingMeetings,
                recentFinancial,
                recentProjects,
                recentMeetings
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
                }),
                // Fetch upcoming events
                prisma.event.findMany({
                    where: {
                        ...where,
                        startDate: {
                            gte: new Date()
                        }
                    },
                    orderBy: {
                        startDate: 'asc'
                    },
                    take: 3,
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        venue: true
                    }
                }),
                // Fetch upcoming meetings
                prisma.meeting.findMany({
                    where: {
                        ...where,
                        date: {
                            gte: new Date()
                        }
                    },
                    orderBy: {
                        date: 'asc'
                    },
                    take: 3,
                    select: {
                        id: true,
                        title: true,
                        date: true,
                        venue: true,
                        type: true
                    }
                }),
                // Fetch recent activity sources
                prisma.financialRecord.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    take: 5
                }),
                prisma.project.findMany({
                    where,
                    orderBy: { updatedAt: 'desc' },
                    take: 5
                }),
                prisma.meeting.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: 5
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

            // Combine and sort upcoming items (events + meetings)
            const upcomingItems = [
                ...upcomingEvents.map(e => ({
                    type: 'event',
                    id: e.id,
                    title: e.title,
                    date: e.startDate,
                    location: e.venue
                })),
                ...upcomingMeetings.map(m => ({
                    type: 'meeting',
                    id: m.id,
                    title: m.title,
                    date: m.date,
                    location: m.venue,
                    meetingType: m.type
                }))
            ]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3);

            // Combine and sort recent activity
            const recentActivity = [
                ...recentFinancial.map(r => ({
                    type: 'finance',
                    id: r.id,
                    title: r.description || 'Financial Record',
                    subtitle: `${r.type === 'income' ? '+' : '-'}$${r.amount} • ${r.category}`,
                    date: r.date,
                    status: 'completed'
                })),
                ...recentProjects.map(p => ({
                    type: 'project',
                    id: p.id,
                    title: p.title,
                    subtitle: `${p.status.charAt(0).toUpperCase() + p.status.slice(1)} Project`,
                    date: p.updatedAt,
                    status: p.status
                })),
                ...recentMeetings.map(m => ({
                    type: 'meeting',
                    id: m.id,
                    title: m.title,
                    subtitle: `${m.type} Meeting`,
                    date: m.createdAt,
                    status: m.status
                }))
            ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            return NextResponse.json({
                stats: {
                    projects: projectCount,
                    meetings: meetingCount,
                    events: eventCount,
                    budget: budgetBalance,
                    totalProjectsCompleted,
                    totalServiceHours,
                    totalBeneficiaries,
                    upcomingItems,
                    recentActivity
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

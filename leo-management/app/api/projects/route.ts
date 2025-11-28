import { NextRequest, NextResponse } from 'next/server';
import { withAuth, checkClubAccess } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const where = auth.role === 'admin' ? {} : { clubId: auth.clubId! };

            const projects = await prisma.project.findMany({
                where,
                include: {
                    club: { select: { name: true } },
                    user: { select: { username: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ projects });
        } catch (error) {
            console.error('Get projects error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch projects' },
                { status: 500 }
            );
        }
    });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const {
                title,
                description,
                category,
                venue,
                date,
                beneficiaries,
                serviceHours,
                participants,
                chairman,
                secretary,
                treasurer,
                projectObjective,
                benefitingCommunity,
                identifiedCommunityNeed,
                serviceOpportunity,
                modeOfDataCollection,
                photos,
                documents,
            } = body;

            if (!title || !date) {
                return NextResponse.json(
                    { error: 'Title and date are required' },
                    { status: 400 }
                );
            }

            const clubId = auth.role === 'admin' ? body.clubId : auth.clubId;

            if (!clubId) {
                return NextResponse.json(
                    { error: 'Club ID is required' },
                    { status: 400 }
                );
            }

            const project = await prisma.project.create({
                data: {
                    clubId,
                    title,
                    description,
                    category,
                    venue,
                    date: new Date(date),
                    beneficiaries: beneficiaries ? parseInt(beneficiaries) : undefined,
                    serviceHours: serviceHours ? parseFloat(serviceHours) : undefined,
                    participants: participants ? parseInt(participants) : undefined,
                    chairman,
                    secretary,
                    treasurer,
                    projectObjective,
                    benefitingCommunity,
                    identifiedCommunityNeed,
                    serviceOpportunity,
                    modeOfDataCollection,
                    photos: photos ? JSON.stringify(photos) : undefined,
                    documents: documents ? JSON.stringify(documents) : undefined,
                    createdBy: auth.userId,
                },
            });

            return NextResponse.json({ project });
        } catch (error) {
            console.error('Create project error:', error);
            return NextResponse.json(
                { error: 'Failed to create project' },
                { status: 500 }
            );
        }
    });
}

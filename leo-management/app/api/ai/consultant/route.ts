import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getProjectConsultation } from '@/lib/ai/groq';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { projectIdea } = body;

            if (!projectIdea) {
                return NextResponse.json(
                    { error: 'Project idea is required' },
                    { status: 400 }
                );
            }

            // Get award and contest guidelines
            const awardDoc = await prisma.referenceDocument.findFirst({
                where: { category: 'award' },
                select: { content: true },
            });

            const contestDoc = await prisma.referenceDocument.findFirst({
                where: { category: 'contest' },
                select: { content: true },
            });

            const consultation = await getProjectConsultation(
                projectIdea,
                awardDoc?.content ?? undefined,
                contestDoc?.content ?? undefined
            );

            // Save to chat history
            await prisma.aIChatHistory.create({
                data: {
                    userId: auth.userId,
                    type: 'consultant',
                    messages: JSON.stringify([
                        { role: 'user', content: projectIdea },
                        { role: 'assistant', content: consultation },
                    ]),
                },
            });

            return NextResponse.json({ consultation });
        } catch (error) {
            console.error('Project consultation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to get project consultation';
            return NextResponse.json(
                { error: errorMessage },
                { status: 500 }
            );
        }
    });
}

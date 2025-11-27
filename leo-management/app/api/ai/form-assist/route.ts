import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getFormAssistance } from '@/lib/ai/groq';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { fieldName, currentData } = body;

            if (!fieldName) {
                return NextResponse.json(
                    { error: 'Field name is required' },
                    { status: 400 }
                );
            }

            // Get reference documents for context
            const referenceDocs = await prisma.referenceDocument.findMany({
                select: { content: true, category: true },
            });

            const referenceData = referenceDocs
                .map((doc) => `${doc.category.toUpperCase()}:\n${doc.content}`)
                .join('\n\n');

            const suggestion = await getFormAssistance(
                fieldName,
                currentData || {},
                referenceData || undefined
            );

            return NextResponse.json({ suggestion });
        } catch (error) {
            console.error('Form assist error:', error);
            return NextResponse.json(
                { error: 'Failed to get AI assistance' },
                { status: 500 }
            );
        }
    });
}

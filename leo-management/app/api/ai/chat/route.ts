import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getGeneralHelp, ChatMessage } from '@/lib/ai/groq';

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { message, conversationHistory } = body;

            if (!message) {
                return NextResponse.json(
                    { error: 'Message is required' },
                    { status: 400 }
                );
            }

            const history: ChatMessage[] = conversationHistory || [];
            const response = await getGeneralHelp(message, history);

            return NextResponse.json({ response });
        } catch (error) {
            console.error('Chat error:', error);
            return NextResponse.json(
                { error: 'Failed to get AI response' },
                { status: 500 }
            );
        }
    });
}

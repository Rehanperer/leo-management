import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIServiceOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Send a chat completion request to Groq API with Llama 3
 */
export async function chat(
    messages: ChatMessage[],
    options: AIServiceOptions = {}
): Promise<string> {
    const {
        model = 'llama-3.3-70b-versatile',
        temperature = 0.7,
        maxTokens = 2048,
    } = options;

    try {
        const completion = await groq.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to get AI response');
    }
}

/**
 * Get AI assistance for filling project report forms
 */
export async function getFormAssistance(
    fieldName: string,
    currentData: Record<string, any>,
    referenceData?: string
): Promise<string> {
    const systemPrompt = `You are an AI assistant helping Leo Club members fill out project reports. 
Provide concise, professional suggestions for form fields based on the project context.
${referenceData ? `Reference Guidelines:\n${referenceData}\n` : ''}`;

    const userPrompt = `Help me fill the "${fieldName}" field for this project.
Current project data: ${JSON.stringify(currentData, null, 2)}

Provide a clear, professional suggestion for this field. Keep it concise and relevant.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    return await chat(messages, { temperature: 0.6, maxTokens: 500 });
}

/**
 * Get AI consultation for improving project ideas
 */
export async function getProjectConsultation(
    projectIdea: string,
    awardGuidelines?: string,
    contestGuidelines?: string
): Promise<string> {
    const systemPrompt = `You are an expert Leo Club project consultant with deep knowledge of:
- Leo Club values and objectives
- Community service best practices
- Project planning and execution
- Award criteria and contest guidelines

Your role is to help improve project ideas by:
1. Analyzing alignment with Leo values
2. Suggesting improvements for greater impact
3. Identifying potential challenges
4. Recommending specific actions based on award/contest criteria

${awardGuidelines ? `\n=== AWARD CRITERIA ===\n${awardGuidelines}\n` : ''}
${contestGuidelines ? `\n=== CONTEST GUIDELINES ===\n${contestGuidelines}\n` : ''}`;

    const userPrompt = `Please analyze and provide improvement suggestions for this project idea:

${projectIdea}

Provide:
1. **Strengths**: What's good about this idea
2. **Improvement Areas**: Specific ways to enhance the project
3. **Award Alignment**: How it aligns with award criteria (if applicable)
4. **Action Steps**: Concrete next steps to develop this project

Be specific and actionable.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    return await chat(messages, { temperature: 0.7, maxTokens: 2048 });
}

/**
 * General help chat for app usage and Leo movement questions
 */
export async function getGeneralHelp(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    const systemPrompt = `You are a helpful AI assistant for a Leo Club management application. You can help with:
- How to use the app features
- Leo Club and Lions Club information
- General questions about reporting, projects, events
- Best practices for club management

Be friendly, concise, and helpful.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
    ];

    return await chat(messages, { temperature: 0.7, maxTokens: 1024 });
}

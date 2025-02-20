import { streamText, Message } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  try {
    const { question, context } = await req.json();

    // Prepare context from search results
    const contextText = context
      .map(
        (item: any) =>
          `${item.metadata.title || item.metadata.fileName}:\n${item.content}\n`
      )
      .join('\n');

    // Build messages array instead of a raw prompt
    const messages: Message[] = [
      {
        role: 'assistant',
        content:
          'You are an AI assistant that provides clear, actionable instructions based on any documentation. Provide direct recommendations and practical steps without referring to the documentation explicitly.',
        id: 'system',
      },
      {
        role: 'user',
        content: `Question: "${question}"\n\nDocumentation:\n${contextText}`,
        id: 'user-1',
      },
    ];

    // Stream the response using streamText
    const stream = streamText({
      model: openai('gpt-4o'),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Return the stream using toDataStreamResponse
    return stream.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
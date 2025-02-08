import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, context } = req.body;

    // Prepare context from search results
    const contextText = context
      .map(
        (item) =>
          `${item.metadata.title || item.metadata.fileName}:\n${item.content}\n`
      )
      .join('\n');

    const prompt = `Using the provided documentation, answer the question. Ensure that your answer is clear, concise, and provides actionable directives. Avoid referencing the documentation directly (e.g., do not say "the context shows that..."). Instead, state what should be done. Questio/Query: "${question}"\n\nDocumentation:\n${contextText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that provides clear, actionable instructions based on any documentation. Your responses should offer direct recommendations and practical steps without referring to the documentation explicitly. Focus on telling the user what to do or explain what the documentation says.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    res.status(200).json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

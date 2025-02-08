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
      .map(item => `${item.metadata.title || item.metadata.fileName}:\n${item.content}\n`)
      .join('\n');

    const prompt = `Based on the following documentation context, please answer the question provided.Ensure your response is clear, concise, and directly related to the information presented in the context.Provide any necessary explanations or definitions for complex terms used in the context, and ensure that your answer is well-structured. Question: "${question}"\n\nContext:\n${contextText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers questions about Upstash documentation. Keep your answers concise and focused on the provided context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    res.status(200).json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

import { useState } from 'react';

export function useAiChat() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiQuestion = async (question: string, context: any[]) => {
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      setAiResponse(data.response);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsAiLoading(false);
    }
  };

  return { aiResponse, isAiLoading, setAiResponse, handleAiQuestion };
}

import { useState } from 'react';

export function useAiChat() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiQuestion = async (question: string, context: any[]) => {
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';
      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setAiResponse(accumulatedText);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to get AI response'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return { aiResponse, isAiLoading, setAiResponse, handleAiQuestion };
}

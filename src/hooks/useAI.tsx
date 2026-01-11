import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface SimilarityResult {
  index: number;
  text: string;
  similarity: number;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askTutor = async (
    messages: Message[],
    gradeLevel?: string,
    topicContext?: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-tutor', {
        body: { messages, gradeLevel, topicContext }
      });

      if (fnError) throw fnError;
      return data.message;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (
    topicContent: string,
    topicTitle: string,
    gradeLevel?: string,
    questionCount: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-quiz', {
        body: { topicContent, topicTitle, gradeLevel, questionCount, difficulty }
      });

      if (fnError) throw fnError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (
    prompt: string,
    educationalContext?: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-image', {
        body: { prompt, educationalContext }
      });

      if (fnError) throw fnError;
      return data.image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEmbeddings = async (texts: string[]): Promise<number[][] | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('text-embeddings', {
        body: { texts, operation: 'embed' }
      });

      if (fnError) throw fnError;
      return data.embeddings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get embeddings';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const findSimilar = async (
    query: string,
    documents: string[]
  ): Promise<SimilarityResult[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('text-embeddings', {
        body: { texts: [query, ...documents], operation: 'similarity' }
      });

      if (fnError) throw fnError;
      return data.similarities;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find similar content';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    askTutor,
    generateQuiz,
    generateImage,
    getEmbeddings,
    findSimilar
  };
};

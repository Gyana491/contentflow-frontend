import { useState, useCallback } from 'react';
import { LinkedInService, ContentGenerationRequest } from '../services/linkedin-service';
import { ApiError } from '../services/api';
import { useAuthStore } from '../lib/auth-store';

export interface ContentGenerationInput {
  topic: string;
  contentType?: 'article' | 'trend' | 'news' | 'tutorial';
  tone?: 'professional' | 'casual' | 'inspiring' | 'informative';
  scheduledTime?: string;
}

export interface ContentGenerationResult {
  linkedinPost: string;
  hashtags: string[];
  topic: string;
}

interface UseContentGenerationReturn {
  generateContent: (input: ContentGenerationInput) => Promise<void>;
  content: ContentGenerationResult | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useContentGeneration(): UseContentGenerationReturn {
  const [content, setContent] = useState<ContentGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  const generateContent = useCallback(async (input: ContentGenerationInput) => {
    setIsLoading(true);
    setError(null);
    setContent(null);

    try {
      const request: ContentGenerationRequest = {
        topic: input.topic,
        contentType: input.contentType || 'article',
        tone: input.tone || 'professional',
        scheduledTime: input.scheduledTime,
      };

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication header if available
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request with authentication headers
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      console.log('Content generation response:', result);
      
      // Handle different response structures
      let contentData;
      if (result && typeof result === 'object') {
        if (result.data && result.data.linkedinPost) {
          // Response has a data wrapper
          contentData = result.data;
        } else if (result.linkedinPost) {
          // Response is directly the content data
          contentData = result;
        } else if (result.success && result.data) {
          // Response has success flag and data
          contentData = result.data;
        } else {
          console.error('Unexpected response structure:', result);
          throw new Error('Invalid response structure from content generation');
        }
      } else {
        console.error('Invalid response type:', typeof result, result);
        throw new Error('Invalid response from content generation');
      }
      
      console.log('Content data to be set:', contentData);
      
      if (contentData && contentData.linkedinPost) {
        console.log('Setting content:', contentData);
        setContent(contentData);
      } else {
        console.error('Invalid content data structure:', contentData);
        throw new Error('Invalid response structure from content generation');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      }
      console.error('Content generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  const reset = useCallback(() => {
    setContent(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    generateContent,
    content,
    isLoading,
    error,
    reset,
  };
} 
import { useState, useRef, useCallback, useEffect } from 'react';
import { createMockReadableStream } from '../services/mockStreamService';
import { getResponseForPrompt } from '../services/samplePrompts';

export function useAIStream() {
  const [status, setStatus] = useState('idle');
  const [streamedText, setStreamedText] = useState('');
  const [activePromptText, setActivePromptText] = useState('');

  // AbortController ref to cancel ongoing stream
  const abortControllerRef = useRef(null);
  const lastPromptRef = useRef('');

  const startStream = useCallback(async (promptText) => {
    if (!promptText || !promptText.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // AbortController setup
    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastPromptRef.current = promptText;

    setActivePromptText(promptText);
    setStreamedText('');
    setStatus('streaming');

    const fullResponse = getResponseForPrompt(promptText);

    try {
      const stream = createMockReadableStream({
        text: fullResponse,
        signal: controller.signal,
        chunkDelayMs: 30,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        accumulated += chunkStr;
        setStreamedText(accumulated);
      }

      setStatus('completed');
    } catch (err) {
      if (err?.name === 'AbortError' || abortControllerRef.current?.signal?.aborted) {
        // Expected - user clicked Stop
        setStatus('stopped');
      } else {
        // Unexpected error - log it for debugging
        console.error('Stream error:', err);
        setStatus('stopped');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Stop stream
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('stopped');
  }, []);

  // Retry stream
  const retryStream = useCallback(() => {
    if (lastPromptRef.current) {
      startStream(lastPromptRef.current);
    }
  }, [startStream]);

  const resetStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setStreamedText('');
    setActivePromptText('');
  }, []);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    status,
    streamedText,
    activePromptText,
    startStream,
    stopStream,
    retryStream,
    resetStream,
    isStreaming: status === 'streaming',
    isStopped: status === 'stopped',
    isCompleted: status === 'completed',
  };
}

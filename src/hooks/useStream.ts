import { useState, useCallback, useRef } from 'react';

interface UseStreamOptions {
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
}

export function useStream(options: UseStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback((url: string) => {
    // Close existing stream if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (error) {
          console.error('Stream parse error:', error);
          options.onError?.(error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('Stream error:', error);
        options.onError?.(error);
        stopStream();
      };

      eventSourceRef.current.addEventListener('done', () => {
        options.onComplete?.();
        stopStream();
      });
    } catch (error) {
      console.error('Failed to start stream:', error);
      setIsStreaming(false);
      options.onError?.(error);
    }
  }, [options]);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    startStream,
    stopStream,
  };
}
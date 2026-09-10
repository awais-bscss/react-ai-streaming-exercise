export function tokenizeText(fullText) {
  const regex = /(\s+|[a-zA-Z0-9_]+|[^\s\w])/g;
  const chunks = [];
  let match;
  while ((match = regex.exec(fullText)) !== null) {
    chunks.push(match[0]);
  }
  return chunks.length > 0 ? chunks : [fullText];
}

export function createMockReadableStream({ text, signal, chunkDelayMs = 30 }) {
  const chunks = tokenizeText(text);
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      if (signal?.aborted) {
        controller.error(new DOMException('Stream aborted', 'AbortError'));
        return;
      }

      let currentIndex = 0;
      let timeoutId = null;

      // Handle abort signal
      const onAbort = () => {
        if (timeoutId) clearTimeout(timeoutId);
        try {
          controller.error(new DOMException('Stream aborted', 'AbortError'));
        } catch {}
      };

      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }

      function pushNextChunk() {
        if (signal?.aborted) return;

        if (currentIndex < chunks.length) {
          const chunkStr = chunks[currentIndex];
          const encodedChunk = encoder.encode(chunkStr);

          try {
            controller.enqueue(encodedChunk);
            currentIndex++;
            timeoutId = setTimeout(pushNextChunk, chunkDelayMs);
          } catch (err) {
            console.warn('Enqueue error:', err);
          }
        } else {
          if (signal) signal.removeEventListener('abort', onAbort);
          try {
            controller.close();
          } catch {}
        }
      }

      pushNextChunk();
    }
  });
}

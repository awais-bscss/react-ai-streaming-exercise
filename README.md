# React AI Streaming UI

A ChatGPT-inspired real-time AI streaming simulator built with **React**, **Vite**, and browser-native **Web Streams API**. Demonstrates token-by-token incremental rendering, stream cancellation via `AbortController`, and React performance optimization with custom hooks.

---

## Overview

In modern AI applications, model responses are transmitted as chunks over HTTP streams or Server-Sent Events (SSE). This project replicates that experience entirely on the client side using web standards:

- **`ReadableStream`** - Ingests binary `Uint8Array` chunks from a stream source
- **`TextEncoder` / `TextDecoder`** - Encodes text to binary on the mock server, decodes binary back to text on the client
- **`AbortController`** - Provides immediate stream cancellation via `controller.abort()`
- **`react-markdown`** - Renders streamed text as formatted markdown (headings, lists, code blocks) in real time
- **State Lifecycle** - Manages transitions between `idle`, `streaming`, `stopped`, and `completed`
- **Custom Hook** - All stream logic is encapsulated in `useAIStream` for clean separation of concerns

---

## Features

| Feature | Details |
| :--- | :--- |
| **Start** | Sends prompt to mock stream service and begins token-by-token rendering |
| **Stop Generation** | Immediately cancels active stream via `AbortController` while preserving partial output |
| **Retry** | Re-runs the last prompt without user re-typing using `lastPromptRef` |
| **Auto-Scroll** | Viewport stays anchored to new tokens as they stream in using `useEffect` + `useRef` |
| **New Chat** | Cleanly resets all state back to the initial centered hero view |
| **Copy to Clipboard** | Copies full response with visual feedback (tick icon for 2 seconds) |
| **Suggestion Chips** | Pre-built prompts for quick one-click testing |

---

## Project Structure

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── ChatInput.jsx
│   └── ResponseView.jsx
├── hooks/
│   └── useAIStream.js
└── services/
    ├── mockStreamService.js
    └── samplePrompts.js
```

---

## Technical Implementation

### 1. Text Tokenization (`mockStreamService.js`)

Before streaming, the full response text is split into natural tokens (words, spaces, punctuation) using a regex:

```javascript
const regex = /(\s+|[a-zA-Z0-9_]+|[^\s\w])/g;
```

This preserves whitespace and newlines so paragraph formatting stays intact during incremental rendering.

### 2. ReadableStream Generation (`mockStreamService.js`)

Each token is encoded to binary and pushed into a `ReadableStream` with a 30ms delay to simulate a live AI response:

```javascript
const encoder = new TextEncoder();

return new ReadableStream({
  start(controller) {
    function pushNextChunk() {
      const encodedChunk = encoder.encode(chunks[currentIndex]);
      controller.enqueue(encodedChunk);         // Push binary chunk into the stream
      currentIndex++;
      timeoutId = setTimeout(pushNextChunk, 30); // Next token in 30ms
    }
    pushNextChunk();
  }
});
```

`timeoutId` is stored so it can be cleared immediately when `AbortController` fires.

### 3. Stream Reading & Decoding (`useAIStream.js`)

The hook reads chunks from the stream asynchronously and decodes them back to text:

```javascript
const reader = stream.getReader();
const decoder = new TextDecoder('utf-8');
let accumulated = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunkStr = decoder.decode(value, { stream: true });
  accumulated += chunkStr;
  setStreamedText(accumulated);       // Triggers re-render with each new token
}
setStatus('completed');
```

`{ stream: true }` ensures multi-byte UTF-8 sequences split across chunk boundaries are buffered correctly.

### 4. AbortController Lifecycle (`useAIStream.js`)

A new controller is created for every stream session and stored in a `useRef` (not `useState`) to avoid triggering re-renders on assignment:

```javascript
const controller = new AbortController();
abortControllerRef.current = controller;

// On Stop Generation:
abortControllerRef.current.abort();
```

When aborted, `onAbort` in the service fires `clearTimeout(timeoutId)` to kill the pending timer, then `controller.error()` to collapse the stream. The `catch` block differentiates between an expected `AbortError` (user clicked Stop) and unexpected errors (logged to console). All partial text is preserved in state.

### 5. State Lifecycle

| State | Description | Available Actions |
| :--- | :--- | :--- |
| `idle` | Awaiting user input | Start |
| `streaming` | Consuming stream chunks | Stop generation |
| `stopped` | Stream halted by user | Retry, New Chat, Copy |
| `completed` | Stream finished successfully | Retry, New Chat, Copy |

---

## React Hooks Used

| Hook | Where | Why |
| :--- | :--- | :--- |
| `useState` | `useAIStream`, `App`, `ResponseView` | Track UI-changing state (status, streamed text, input, copied) |
| `useRef` | `useAIStream`, `App` | Hold `AbortController` and scroll anchor without triggering re-renders |
| `useCallback` | `useAIStream`, `App`, `ChatInput` | Memoize stream functions and event handlers to prevent child components re-rendering on every 30ms token arrival |
| `React.memo` | `ChatInput`, `ResponseView` | Skip child component re-renders when parent re-renders with unchanged props |
| `useEffect` | `useAIStream`, `App` | Cleanup stream on unmount; auto-scroll on new token |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production (optional)
npm run build

# 4. Preview production build (optional)
npm run preview
```


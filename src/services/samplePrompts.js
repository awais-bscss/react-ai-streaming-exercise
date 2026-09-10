export const SAMPLE_PROMPTS = [
  {
    id: 'react-rendering',
    title: 'React Rendering & Virtual DOM',
    prompt: 'Explain React rendering, Virtual DOM reconciliation, and why keys matter in lists.',
    response: `React Rendering & Virtual DOM Reconciliation

When state changes in a React component, React triggers a re-render through its reconciliation pipeline.

1. The Virtual DOM Tree
React maintains a lightweight in-memory representation of the actual DOM. When state or props update, React invokes the component function to produce a new Virtual DOM tree, then compares it with the previous one using a diffing algorithm with O(n) complexity.

2. Why Stable Keys Matter
When rendering lists, React uses the key prop to preserve element identity across renders. Without stable keys, reordering causes React to mutate DOM nodes inefficiently. Stable unique keys let React reuse existing DOM nodes and simply adjust their positions.

3. Fiber and Incremental Rendering
The Fiber reconciler splits rendering into two phases:
- Render Phase (async, interruptible): calculates what changed without touching the real DOM.
- Commit Phase (synchronous): applies all mutations in one batched pass to avoid layout thrashing.`,
  },
  {
    id: 'abort-controller',
    title: 'AbortController in AI Streaming',
    prompt: 'How does AbortController work to stop an active AI stream in React?',
    response: `AbortController in AI Streaming

In production AI applications, streaming responses arrive chunk-by-chunk via HTTP streams or Server-Sent Events.

1. Initializing the Controller
We create an AbortController instance and pass its signal to the stream consumer:

  const controller = new AbortController();
  const signal = controller.signal;

2. Stopping Generation on User Action
When the user clicks Stop Generation, controller.abort() is called. The active ReadableStream read loop receives an AbortError and halts immediately.

3. State Preservation
Unlike a network error, an intentional abort preserves all tokens streamed up to that point. The UI locks into a Stopped state without losing the partial response already received.`,
  },
  {
    id: 'react-performance',
    title: 'React Performance & Memoization',
    prompt: 'Why is memoization critical when streaming tokens at 40-60 chunks per second in React?',
    response: `React Performance During Real-Time Streaming

Streaming text at 40 to 60 chunks per second puts pressure on React's rendering pipeline.

1. The Problem: Cascading Re-Renders
If streaming state lives at the top-level parent, every incoming token triggers a full re-render of all child components including navbars, buttons, and previous messages.

2. The Solutions
- State Colocation: Keep the active streaming buffer close to the component that renders it, so only that component re-renders per token.
- React.memo: Wrap completed message components so React skips re-evaluating them while new tokens arrive.
- useCallback and useRef: Use stable callback references and mutable refs for abort controllers and timers to avoid triggering unnecessary effect re-runs.`,
  },
];

export function getResponseForPrompt(promptText) {
  if (!promptText || !promptText.trim()) {
    return 'Please enter a prompt to receive a streamed response.';
  }

  const clean = promptText.trim().toLowerCase();
  const matched = SAMPLE_PROMPTS.find(
    (p) =>
      p.prompt.toLowerCase().includes(clean) ||
      clean.includes(p.prompt.toLowerCase()) ||
      p.title.toLowerCase().includes(clean)
  );

  if (matched) return matched.response;

  return `Response to: "${promptText.trim()}"

Your question has been received. Here is a breakdown:

In frontend engineering, real-time data flow requires careful coordination between async data sources and declarative UI state.

Key concepts involved:
- Stream Ingestion: chunks arrive via ReadableStream and are decoded into text using TextDecoder.
- Lifecycle Management: user intent is controlled through an AbortController for cancellation at any point.
- Optimized Rendering: state updates are colocated to avoid re-rendering unrelated parts of the UI.

  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    appendToken(decoder.decode(value, { stream: true }));
  }

This response was streamed token by token to demonstrate the Start, Stop, and Retry lifecycle.`;
}

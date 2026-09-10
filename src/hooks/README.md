# Streaming Hooks

This directory contains custom React hooks responsible for stream state management and lifecycle control.

---

## `useAIStream`

The `useAIStream` hook encapsulates the consumption of a `ReadableStream`, coordinates the `AbortController` cancellation lifecycle, and provides methods to Start, Stop, and Retry generation.

### State Values

| Property | Type | Description |
| :--- | :--- | :--- |
| `status` | `string` | Current stream state: `'idle'`, `'streaming'`, `'stopped'`, `'completed'` |
| `streamedText` | `string` | Accumulated text content decoded from incoming chunks |
| `activePromptText` | `string` | The prompt currently being answered |
| `isStreaming` | `boolean` | Shorthand for `status === 'streaming'` |
| `isStopped` | `boolean` | Shorthand for `status === 'stopped'` |
| `isCompleted` | `boolean` | Shorthand for `status === 'completed'` |

### Action Handlers

- **`startStream(promptText)`**:
  - Aborts any ongoing stream.
  - Instantiates a new `AbortController` and stores it in `abortControllerRef`.
  - Obtains a `ReadableStream` and consumes it using `reader.read()` and `TextDecoder`.
  - Updates `streamedText` incrementally as chunks arrive.
  - Catches `AbortError` when cancelled and sets status to `'stopped'`.
  - Sets status to `'completed'` upon reaching `done: true`.

- **`stopStream()`**:
  - Calls `abortControllerRef.current.abort()`.
  - Halts incoming chunk processing immediately.
  - Retains all text received up to the cancellation point.
  - Sets status to `'stopped'`.

- **`retryStream()`**:
  - Re-triggers `startStream` using the last active prompt string.

- **`resetStream()`**:
  - Aborts any active stream.
  - Clears accumulated text and prompt state.
  - Returns hook to `'idle'` state.

### Lifecycle & Unmount Safety

The hook registers an unmount cleanup effect:

```javascript
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

This guarantees that in-flight network streams or timers are cancelled when the component unmounts.

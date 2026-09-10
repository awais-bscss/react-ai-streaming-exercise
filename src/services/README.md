# Services

This directory contains services responsible for streaming emulation and response data resolution.

---

## `mockStreamService.js`

Provides a mock streaming service built directly on the browser's native `ReadableStream` API, mimicking real-world Server-Sent Events (SSE) and HTTP streaming responses.

### Functions

#### `tokenizeText(fullText)`
- Splits a text string into realistic token fragments (words, punctuation, whitespace).
- Returns an array of token strings.

#### `createMockReadableStream({ text, signal, chunkDelayMs })`
- **Parameters**:
  - `text` (`string`): The full response string to stream.
  - `signal` (`AbortSignal`, optional): DOM `AbortSignal` for cancellation support.
  - `chunkDelayMs` (`number`, default `30`): Delay in milliseconds between consecutive chunks.
- **Returns**: `ReadableStream<Uint8Array>`
- **Mechanics**:
  1. Checks if `signal.aborted` is already set; if so, immediately errors with `AbortError`.
  2. Sets up an `abort` event listener on `signal` to clear active timeouts and error the controller with `AbortError`.
  3. Encodes each string token into a binary `Uint8Array` using `TextEncoder`.
  4. Enqueues chunks incrementally into the stream controller until all tokens are sent.
  5. Closes the stream controller upon completion.

---

## `samplePrompts.js`

Contains technical prompt presets and a response generator for arbitrary user prompts.

### Exports

#### `SAMPLE_PROMPTS`
An array of pre-configured engineering prompt objects:
- React Rendering & Virtual DOM
- AbortController in AI Streaming
- React Performance & Memoization

#### `getResponseForPrompt(promptText)`
- Resolves a response based on the input text.
- If the prompt matches or is related to a preset, returns the corresponding structured response.
- If a custom prompt is provided, returns a structured, multi-paragraph simulated technical response formatted with headings and code blocks.

# Components

This directory contains modular presentation and interaction components for the chat application.

---

## `ChatInput.jsx`

A pill-shaped input component matching the modern AI chat interface.

### Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | Current text value of the prompt textarea |
| `onChange` | `function` | Callback invoked on textarea text change |
| `onStart` | `function` | Callback to trigger stream generation |
| `onStop` | `function` | Callback to halt stream via AbortController |
| `onNewChat` | `function` | Callback to reset session back to initial state |
| `isStreaming` | `boolean` | Flag indicating whether generation is currently active |

### Key Behaviors

- **Keyboard Handling**: Pressing `Enter` without `Shift` triggers `onStart()`.
- **Component Memoization**: Wrapped with `React.memo` to avoid re-renders while tokens stream into `App`.
- **Dynamic Toggle Button**:
  - When `isStreaming` is `false`: Displays an upward arrow button to start generation.
  - When `isStreaming` is `true`: Switches to a stop button to cancel generation.
- **New Chat Button**: The `+` icon button is disabled while `isStreaming` is active to prevent session conflicts during generation.

---

## `ResponseView.jsx`

Renders streamed text tokens incrementally, including formatted markdown structures, code blocks, and completion actions.

### Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `streamedText` | `string` | Raw streamed text accumulated from the ReadableStream |
| `isStreaming` | `boolean` | Flag indicating whether chunks are currently arriving |
| `isStopped` | `boolean` | Flag indicating stream was halted via AbortController |
| `isCompleted` | `boolean` | Flag indicating stream reached normal completion |
| `onRetry` | `function` | Callback to regenerate response for active prompt |

### Key Behaviors

- **Markdown & Code Parsing**: Splits incoming text into code blocks (` ``` `), headings (`###`, `####`), bullet points, bold text, and paragraphs on the fly.
- **Component Memoization**: Wrapped with `React.memo` to avoid re-parsing markdown when user types in the prompt input.
- **Blinking Caret**: Displays an inline animated cursor while `isStreaming` is active.
- **Stopped Notice**: Renders a subtle notification when generation is stopped by the user.
- **Conditional Actions**: The **Retry** and **Copy** buttons are hidden during streaming and only appear once the response completes or is stopped.

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { SquarePen, ArrowUp, Square } from 'lucide-react';

export const ChatInput = React.memo(function ChatInput({
  value,
  onChange,
  onStart,
  onStop,
  onNewChat,
  isStreaming,
}) {
  const textareaRef = useRef(null);
  const [isMultiLine, setIsMultiLine] = useState(false);

  // Auto-resize only when text exceeds a single line, keeping starting UI slim & centered
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!value || !value.trim()) {
      textarea.style.height = '';
      setIsMultiLine(false);
      return;
    }

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > 35) {
      setIsMultiLine(true);
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    } else {
      setIsMultiLine(false);
      textarea.style.height = '';
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onStart();
      }
    },
    [onStart]
  );

  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);

  return (
    <div className={`gpt-input-pill ${isMultiLine ? 'is-multiline' : ''}`}>
      <button
        type="button"
        className="gpt-plus-btn"
        onClick={onNewChat}
        disabled={isStreaming}
        title={isStreaming ? 'Wait for response to finish' : 'New Chat'}
      >
        <SquarePen size={16} />
      </button>

      <textarea
        ref={textareaRef}
        className="gpt-hero-textarea"
        placeholder="Ask anything..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        rows={1}
      />

      {isStreaming ? (
        <button
          type="button"
          className="gpt-send-btn stop-mode"
          onClick={onStop}
          title="Stop generation"
        >
          <Square size={12} fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          className={`gpt-send-btn ${value.trim() ? 'active' : ''}`}
          onClick={onStart}
          disabled={!value.trim()}
          title="Start"
          id="btn-start"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
});

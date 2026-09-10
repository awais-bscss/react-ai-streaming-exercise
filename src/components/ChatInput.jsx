import React from 'react';
import { SquarePen, ArrowUp, Square } from 'lucide-react';

export function ChatInput({
  value,
  onChange,
  onStart,
  onStop,
  onNewChat,
  isStreaming,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onStart();
    }
  };

  return (
    <div className="gpt-input-pill">
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
        className="gpt-hero-textarea"
        placeholder="Ask anything..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
}

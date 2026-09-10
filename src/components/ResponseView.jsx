import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RefreshCw, Copy, Check, PauseCircle } from 'lucide-react';

export const ResponseView = React.memo(function ResponseView({
  streamedText,
  isStreaming,
  isStopped,
  isCompleted,
  onRetry,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!streamedText) return;
    navigator.clipboard.writeText(streamedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gpt-assistant-row">
      <div className="gpt-assistant-content">
        <div className="gpt-response-text">
          <ReactMarkdown>{streamedText}</ReactMarkdown>
        </div>

        {isStopped && (
          <div className="gpt-stopped-note">
            <PauseCircle size={15} />
            <span>Stream stopped by user.</span>
          </div>
        )}
      </div>

      {(isCompleted || isStopped) && (
        <div className="gpt-response-actions">
          <button
            type="button"
            className="gpt-action-btn"
            onClick={onRetry}
            title="Retry"
            id="btn-retry"
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>

          <button
            type="button"
            className="gpt-action-btn"
            onClick={handleCopy}
            title="Copy"
          >
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
    </div>
  );
});

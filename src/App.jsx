import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIStream } from './hooks/useAIStream';
import { SAMPLE_PROMPTS } from './services/samplePrompts';
import { ChatInput } from './components/ChatInput';
import { ResponseView } from './components/ResponseView';
import { Layers, ShieldAlert, Zap, Square } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);

  const {
    streamedText,
    activePromptText,
    startStream,
    stopStream,
    retryStream,
    resetStream,
    isStreaming,
    isStopped,
    isCompleted,
  } = useAIStream();

  const hasConversation = Boolean(activePromptText || streamedText || isStreaming || isStopped || isCompleted);

  // Auto-scroll as tokens stream in
  useEffect(() => {
    if (hasConversation && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamedText, hasConversation]);

  // Start stream
  const handleStart = useCallback((promptToRun) => {
    const text = promptToRun !== undefined ? promptToRun : inputText;
    if (!text || !text.trim() || isStreaming) return;
    startStream(text.trim());
    setInputText('');
  }, [inputText, isStreaming, startStream]);

  // Reset to initial centered view
  const handleNewChat = useCallback(() => {
    resetStream();
    setInputText('');
  }, [resetStream]);

  return (
    <div className="gpt-app">
      {!hasConversation && (
        <div className="gpt-hero-container">
          <div className="gpt-hero-content">
            <h1 className="gpt-hero-title">What can I help you with?</h1>

            <div className="gpt-input-pill-wrapper">
              <ChatInput
                value={inputText}
                onChange={setInputText}
                onStart={() => handleStart()}
                onStop={stopStream}
                onNewChat={handleNewChat}
                isStreaming={isStreaming}
              />
            </div>

            <div className="gpt-suggestions-list">
              <button 
                type="button" 
                className="suggestion-item" 
                onClick={() => handleStart(SAMPLE_PROMPTS[0].prompt)}
              >
                <Layers size={16} className="suggestion-icon" />
                <span>Explain React Rendering & Virtual DOM</span>
              </button>

              <button 
                type="button" 
                className="suggestion-item" 
                onClick={() => handleStart(SAMPLE_PROMPTS[1].prompt)}
              >
                <ShieldAlert size={16} className="suggestion-icon" />
                <span>How to stop an active stream</span>
              </button>

              <button 
                type="button" 
                className="suggestion-item" 
                onClick={() => handleStart(SAMPLE_PROMPTS[2].prompt)}
              >
                <Zap size={16} className="suggestion-icon" />
                <span>Why memoization matters at 60 tokens/sec</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {hasConversation && (
        <div className="gpt-chat-container">
          <div className="gpt-scroll-area">
            <div className="gpt-message-inner">
              <div className="gpt-user-row">
                <div className="gpt-user-bubble">
                  <p>{activePromptText}</p>
                </div>
              </div>

              <ResponseView
                streamedText={streamedText}
                isStreaming={isStreaming}
                isStopped={isStopped}
                isCompleted={isCompleted}
                onRetry={retryStream}
              />

              <div ref={chatBottomRef} />
            </div>
          </div>

          <div className="gpt-bottom-bar">
            <div className="gpt-bottom-inner">
              {isStreaming && (
                <div className="gpt-stop-pill-container">
                  <button
                    type="button"
                    className="gpt-stop-pill"
                    onClick={stopStream}
                    id="btn-stop"
                  >
                    <Square size={13} fill="currentColor" />
                    <span>Stop generation</span>
                  </button>
                </div>
              )}

              <ChatInput
                value={inputText}
                onChange={setInputText}
                onStart={() => handleStart()}
                onStop={stopStream}
                onNewChat={handleNewChat}
                isStreaming={isStreaming}
              />

              <div className="gpt-disclaimer">
                <span>Start, Stop & Retry</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

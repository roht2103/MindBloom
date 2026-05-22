'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { AIChatService } from '@/services/ai-chat-service';

export default function ChatPage() {
  const { messages, addMessage, clearChat } = useMindBloom();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages list changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Send user message
    addMessage('user', textToSend);
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI companion response
      const response = await AIChatService.generateCompanionResponse(textToSend, messages);
      addMessage('assistant', response.content, response.sentiment);
    } catch (err) {
      console.error(err);
      addMessage('assistant', "I'm sorry, I encountered a brief disconnect. How can I help you find calm right now?");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Find the last user sentiment to display in the side analyzer panel
  const userMessages = messages.filter(m => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  const currentSentiment = lastAssistantMessage?.sentiment || 'Peaceful';

  const quickPrompts = [
    "I'm feeling really stressed today.",
    "Can you suggest a grounding activity?",
    "I feel overwhelmed by my workload.",
    "I had a great day today!"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* 1. Mascot Profile & Sentiment Dashboard (Left/Top) */}
      <aside className="w-full lg:w-[280px] bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex flex-col gap-5 shrink-0 justify-between">
        <div className="space-y-5">
          {/* Mascot Info */}
          <div className="text-center pb-4 border-b border-outline-variant/15">
            <div 
              className="w-16 h-16 bg-primary/10 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner border border-primary/20"
              style={{ borderRadius: '50%' }}
            >
              🌱
            </div>
            <h2 className="text-base font-display font-extrabold text-on-surface">Bloom Companion</h2>
            <p className="text-[11px] text-secondary font-bold uppercase tracking-wider mt-1">Empathetic AI</p>
          </div>

          {/* Real-time Sentiment Classifier Display */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Companion Sentiment Analyzer
            </span>
            <div className="bg-surface border border-outline-variant/15 p-3 rounded-[4px] flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">
                insights
              </span>
              <div>
                <p className="text-xs font-bold text-on-surface-variant">Detected Sentiment</p>
                <p className="text-sm font-extrabold text-primary mt-0.5">{currentSentiment}</p>
              </div>
            </div>
          </div>

          {/* Secure & Private Indicator */}
          <div className="bg-secondary/5 border border-secondary/15 p-3 rounded-[4px] space-y-1.5">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span className="text-[11px] font-bold">Confidential Space</span>
            </div>
            <p className="text-[10px] leading-relaxed text-on-surface-variant font-medium">
              Your conversations are private, local-first, and never sold. You are in a secure room.
            </p>
          </div>
        </div>

        {/* Clear chat command */}
        <button
          onClick={clearChat}
          className="w-full flex items-center justify-center gap-1.5 border border-red-500/20 hover:bg-red-500/5 text-red-500 hover:text-red-600 py-2 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
          Clear Chat History
        </button>
      </aside>

      {/* 2. Interactive Chat Window (Center/Main) */}
      <section className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] flex flex-col overflow-hidden">
        {/* Chat header info */}
        <header className="px-5 py-3 border-b border-outline-variant/15 flex items-center justify-between shrink-0 bg-surface/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-secondary rounded-full" style={{ borderRadius: '50%' }}></div>
            <span className="text-xs font-bold text-on-surface">Bloom is Online</span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-semibold">
            Running KevSun/mentalhealth_LM
          </span>
        </header>

        {/* Message bubble stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-0 bg-soft-gradient">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar icon */}
                <div 
                  className={`w-8 h-8 flex items-center justify-center text-sm shrink-0 border select-none ${
                    isUser 
                      ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                      : 'bg-primary/10 border-primary/20 text-primary'
                  }`}
                  style={{ borderRadius: '50%' }}
                >
                  {isUser ? '👤' : '🌱'}
                </div>

                {/* Message block */}
                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-[4px] text-xs leading-relaxed font-medium shadow-sm border ${
                      isUser
                        ? 'bg-secondary text-on-secondary border-secondary/10'
                        : 'bg-surface border-outline-variant/20 text-on-surface'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.sentiment && !isUser && (
                    <span className="text-[9px] font-bold text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded-sm block w-fit">
                      Sentiment: {msg.sentiment}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
              <div 
                className="w-8 h-8 flex items-center justify-center text-sm shrink-0 bg-primary/10 border border-primary/20 text-primary select-none"
                style={{ borderRadius: '50%' }}
              >
                🌱
              </div>
              <div className="bg-surface border border-outline-variant/25 px-4 py-3 rounded-[4px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce duration-300 delay-75" style={{ borderRadius: '50%' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce duration-300 delay-150" style={{ borderRadius: '50%' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce duration-300 delay-225" style={{ borderRadius: '50%' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-5 py-3 border-t border-outline-variant/15 flex gap-2 overflow-x-auto shrink-0 bg-surface/20 select-none">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 px-3 py-1.5 rounded-[4px] cursor-pointer whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Text Form */}
        <footer className="p-4 border-t border-outline-variant/15 bg-surface/50 flex gap-3 items-center shrink-0">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share what's on your mind... (Press Enter to send)"
            rows={1}
            className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-[4px] px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary placeholder-on-surface-variant/50 resize-none max-h-24 leading-relaxed font-medium"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 bg-primary text-on-primary rounded-[4px] flex items-center justify-center shadow-md shadow-primary/15 hover:bg-primary/95 disabled:bg-primary/50 disabled:shadow-none shrink-0 transition-all select-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </footer>
      </section>
    </div>
  );
}

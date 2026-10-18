import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  Cpu,
  Sparkles,
  Zap,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText,
  Mail,
  Share2,
} from 'lucide-react';

export const NatashaChat: React.FC = () => {
  const {
    chatSessions,
    activeSessionId,
    createChatSession,
    switchChatSession,
    deleteChatSession,
    appendChatMessage,
    clearSessionHistory,
    promptTemplates,
    logActivity,
  } = useDatabase();

  const currentSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  const activeTurnsCount = Math.min(5, currentSession?.messages.length || 0);
  const totalTurnsCount = currentSession?.messages.length || 0;
  const olderPrunedCount = Math.max(0, totalTurnsCount - 5);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setErrorMessage(null);

    // Append User Message to session
    appendChatMessage(currentSession.id, {
      role: 'user',
      content: text,
    });

    setIsLoading(true);

    try {
      // Get Natasha System Instruction from prompt library if customized
      const natashaTpl = promptTemplates.find((t) => t.category === 'natasha');
      const systemInstruction = natashaTpl?.systemInstruction;

      // Construct message history including current user turn
      const existingMsgs = currentSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const fullHistory = [...existingMsgs, { role: 'user' as const, content: text }];

      // Make server-side Gemini API call
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: fullHistory,
          systemInstruction,
          sessionTitle: currentSession.title,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with code ${response.status}`);
      }

      const data = await response.json();

      // Append Natasha response
      appendChatMessage(currentSession.id, {
        role: 'model',
        content: data.text,
        tokensUsed: data.tokensUsed,
        tokensSaved: data.tokensSaved,
      });

      logActivity(
        'Natasha Query',
        'AI Engine',
        `Query answered. Tokens: ${data.tokensUsed} used (Saved ${data.tokensSaved || 0} via 5-message memory logic)`,
        'info'
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to receive response from Natasha AI server.');
      appendChatMessage(currentSession.id, {
        role: 'model',
        content: `Operational dispatch interrupted: ${err.message || 'Internal connection error'}. Please verify server status or retry.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickDirectives = [
    'Audit current low-stock catalog inventory',
    'Draft urgent client update for pending shipments',
    'Generate pricing recommendation for backlit polyester fabric',
    'Review database safety and GitHub sync status',
  ];

  return (
    <div className="flex h-full w-full bg-[#0a0f1d] text-slate-100 overflow-hidden select-text">
      {/* Sessions Sidebar */}
      {showSessionsSidebar && (
        <aside className="w-64 border-r border-white/10 bg-[#070b14] flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white tracking-wider">NATASHA SESSIONS</span>
            </div>
            <button
              onClick={() => createChatSession()}
              className="p-1 rounded-md bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 text-xs transition-colors"
              title="New Chat Session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chatSessions.map((session) => {
              const isActive = session.id === currentSession?.id;
              return (
                <div
                  key={session.id}
                  onClick={() => switchChatSession(session.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-medium'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  {chatSessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Token & Memory Rule Brief */}
          <div className="p-3 bg-black/40 border-t border-white/10 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-sky-400" /> Token Optimization
              </span>
              <span className="text-sky-400 font-mono font-semibold">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Only the last 5 messages are submitted as active context. Earlier history is trimmed or summarized to prevent hitting API quotas.
            </p>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] overflow-hidden">
        {/* Chat Header Bar */}
        <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-[#0e1422] shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSessionsSidebar((prev) => !prev)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 text-xs"
              title="Toggle Sessions Sidebar"
            >
              <Bot className="w-4 h-4 text-sky-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wide">{currentSession?.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono">
                  v5.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Executive AI Operative · Gemini 3.8 Flash</p>
            </div>
          </div>

          {/* Memory Control Metric Indicator */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-[11px]">
              <span className="text-slate-400">Active Window:</span>
              <span className="font-mono text-sky-300 font-semibold">{activeTurnsCount}/5 turns</span>
              {olderPrunedCount > 0 && (
                <span className="text-amber-400 text-[10px]">({olderPrunedCount} summarized)</span>
              )}
            </div>

            <button
              onClick={() => clearSessionHistory(currentSession.id)}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs border border-white/10 transition-colors"
              title="Flush session context"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col gap-1.5 rounded-xl px-4 py-3 text-xs leading-relaxed max-w-2xl ${
                    isUser
                      ? 'bg-sky-600/20 border border-sky-500/30 text-sky-50'
                      : 'bg-[#121929] border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 select-none pb-1 border-b border-white/5">
                    <span className="font-semibold text-slate-300">{isUser ? 'Boss' : 'Natasha v5.6'}</span>
                    <div className="flex items-center gap-2">
                      {msg.tokensUsed && (
                        <span className="font-mono text-slate-400">~{msg.tokensUsed} tokens</span>
                      )}
                      {msg.tokensSaved ? (
                        <span className="font-mono text-emerald-400">(+{msg.tokensSaved} saved)</span>
                      ) : null}
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-[#121929] border border-white/10 rounded-xl px-4 py-3 text-xs flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-slate-400 ml-1">Natasha v5.6 analyzing query...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {currentSession?.messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Quick Queries:</span>
            {quickDirectives.map((directive, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(directive)}
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10 shrink-0 transition-colors"
              >
                {directive}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-[#0e1422] border-t border-white/10 shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Directive for Natasha v5.6... (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 resize-none font-sans"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center justify-center transition-colors shadow-md shadow-sky-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

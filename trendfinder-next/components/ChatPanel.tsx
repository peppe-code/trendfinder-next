'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendItem } from '@/lib/types';

type Message = { role: 'user' | 'assistant'; content: string };

interface ChatPanelProps {
  results: TrendItem[];
}

function buildContext(results: TrendItem[]): string {
  if (!results.length) return '';
  return results
    .slice(0, 8)
    .map(
      (r) =>
        `- ${r.title} | score:${r.score} | crescita:+${r.searchGrowth90d}% | competizione:${r.competition} | prezzo:€${r.avgPrice} | tags:${r.tags.join(',')}`
    )
    .join('\n');
}

const SUGGESTIONS = [
  'Qual è il prodotto con più potenziale?',
  'Analizza la competizione dei risultati',
  'Suggerisci una strategia di pricing',
  'Quali nicchie stanno crescendo di più?',
];

export default function ChatPanel({ results }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: buildContext(results),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Chat error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Errore di connessione. Verifica che la chiave ANTHROPIC_API_KEY sia configurata.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full border rounded bg-white">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">AI Chat</span>
        <span className="text-xs text-slate-400">— analisi trend con Claude</span>
        {streaming && (
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 text-center mb-3">
              Chiedimi qualcosa sui trend o sui prodotti trovati
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="w-full text-left text-xs border rounded px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.content || (
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi un messaggio… (Invio per inviare)"
          rows={2}
          disabled={streaming}
          className="flex-1 border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          className="px-3 py-2 bg-slate-800 text-white rounded text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors self-end"
        >
          Invia
        </button>
      </div>
    </div>
  );
}

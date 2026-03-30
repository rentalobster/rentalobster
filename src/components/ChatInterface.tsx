"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  sessionKey: string;
  agentName: string;
  agentEmoji: string;
};

export default function ChatInterface({ sessionKey, agentName, agentEmoji }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    async function loadHistory() {
      const res = await fetch(`/api/chat/history?session_key=${sessionKey}`);
      if (res.ok) {
        const { messages: hist } = await res.json();
        setMessages(hist ?? []);
      }
    }
    loadHistory();
  }, [sessionKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": sessionKey },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function copyMsg(idx: number, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header — XP title bar */}
      <div className="xp-titlebar gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agentEmoji}</span>
          <span className="xp-titlebar-text">{agentName}</span>
          <span className="flex items-center gap-1 ml-2">
            <span className="w-2 h-2 bg-[#55ff55] animate-mc-flicker inline-block" />
            <span className="font-pixel text-[5px] text-[#aaffaa]">ACTIVE</span>
          </span>
        </div>
        <div className="flex gap-0.5">
          <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
               style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>_</div>
          <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
               style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>□</div>
          <div className="xp-close-btn">✕</div>
        </div>
      </div>

      {/* Messages — sunken panel like XP listbox */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 xp-sunken bg-white" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <span className="text-5xl">{agentEmoji}</span>
            <div className="font-pixel text-[7px] text-[#000]">{agentName} is ready</div>
            <div className="font-retro text-[15px] text-[#666] max-w-xs">
              Start a conversation. Ask anything within this agent&apos;s expertise.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 group",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar — MC block style */}
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center text-sm flex-shrink-0",
                msg.role === "user"
                  ? "mc-block bg-[#2a1a3d]"
                  : "mc-block-green bg-[#1a2a1a]"
              )}
            >
              {msg.role === "user" ? "👤" : agentEmoji}
            </div>

            {/* Bubble — XP-styled */}
            <div
              className={cn(
                "max-w-[75%] px-3 py-2 relative",
                msg.role === "user"
                  ? "xp-raised bg-[#dde4ff] text-[#000]"
                  : "xp-raised bg-[#d8f0d8] text-[#000]"
              )}
            >
              <pre className="whitespace-pre-wrap font-retro text-[15px] leading-tight">{msg.content}</pre>
              <button
                onClick={() => copyMsg(i, msg.content)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 xp-button p-0.5 transition-all"
              >
                {copiedId === i ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 mc-block-green bg-[#1a2a1a] flex items-center justify-center text-sm">
              {agentEmoji}
            </div>
            <div className="xp-raised bg-[#d8f0d8] px-3 py-2">
              <Loader2 className="w-4 h-4 text-[#228822] animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 bg-[#d4d0c8] border-t-2 border-[#808080]" style={{ borderBottom: "2px solid #fff" }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
            rows={1}
            className="flex-1 xp-sunken bg-white font-retro text-[15px] text-[#000] placeholder-[#888] px-3 py-2 resize-none focus:outline-none max-h-32 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="xp-button xp-button-primary p-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="font-retro text-[12px] text-[#666] mt-1 text-center">
          Enter = send · Shift+Enter = new line
        </p>
      </div>
    </div>
  );
}

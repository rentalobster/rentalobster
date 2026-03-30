"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import { ArrowLeft, AlertCircle } from "lucide-react";

function ChatPageInner() {
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get("session") ?? "";

  const [agentName, setAgentName] = useState("");
  const [agentEmoji, setAgentEmoji] = useState("🤖");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionKey) {
      setError("No session key provided.");
      setLoading(false);
      return;
    }
    async function verifySession() {
      const res = await fetch(`/api/chat/history?session_key=${sessionKey}`);
      if (!res.ok) {
        setError("Invalid or expired session key.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.rental_status && data.rental_status !== "active") {
        setError("This session has ended.");
      }
      setLoading(false);
    }

    // Also try to get agent info from rentals
    async function getAgentInfo() {
      // We'll parse from local storage if available
      const stored = localStorage.getItem(`agent_${sessionKey}`);
      if (stored) {
        const info = JSON.parse(stored);
        setAgentName(info.name);
        setAgentEmoji(info.emoji);
      } else {
        setAgentName("AI Agent");
        setAgentEmoji("🤖");
      }
    }

    verifySession();
    getAgentInfo();
  }, [sessionKey]);

  if (loading) {
    return (
      <div className="h-screen  flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Connecting to agent...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen  flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-white font-semibold text-lg mb-2">Session Error</div>
          <div className="text-gray-400 text-sm mb-6">{error}</div>
          <a
            href="/dashboard"
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all inline-block"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col  pt-16">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/30">
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>
        <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
          {sessionKey}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          sessionKey={sessionKey}
          agentName={agentName || "AI Agent"}
          agentEmoji={agentEmoji}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen  flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { colors } from "@/lib/design-system";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ScanView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I received your message. This is a demo response - the actual AI integration will be implemented later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary.base }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "text-gray-900"
                  : "softui-card text-gray-900"
              }`}
              style={{ backgroundColor: message.role === "user" ? colors.primary.base : undefined }}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-[10px] mt-1 opacity-60">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="px-6 pb-6 pt-4 bg-gradient-to-t from-[#f0f0f3] to-transparent">
        <div className="softui-card flex items-center gap-3 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-sm px-3 py-2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.primary.base, boxShadow: colors.shadows.gold }}
          >
            <Send className="w-5 h-5" style={{ color: colors.text.primary }} />
          </button>
        </div>
      </div>
    </div>
  );
}

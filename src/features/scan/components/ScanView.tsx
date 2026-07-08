"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { colors } from "@/lib/design-system";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DBDoc {
  id: string;
  name: string;
}

export function ScanView() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const scenario = searchParams.get("scenario");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitializedScenario, setHasInitializedScenario] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendChatMessage = useCallback(async (chatMessages: Message[]) => {
    setIsTyping(true);
    try {
      // Filter out system greetings or invalid roles if any
      const payloadMessages = chatMessages
        .filter(m => m.id !== "system-greet")
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          documentId: documentId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to get response");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Something went wrong while communicating with Gemini.";
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${errMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [documentId]);

  // Initialize scenario if provided in search params
  useEffect(() => {
    if (scenario && !hasInitializedScenario) {
      setTimeout(() => {
        setHasInitializedScenario(true);
      }, 0);
      
      let promptText = "";
      if (scenario === "cancer") {
        promptText = "I've been diagnosed with cancer. Does my policy cover cancer treatment or critical illness payouts?";
      } else if (scenario === "heart_attack") {
        promptText = "I had a heart attack. What coverage, hospitalisation benefits, or critical illness payouts do I get?";
      } else if (scenario === "stroke") {
        promptText = "I had a stroke. Does my policy cover stroke treatment or critical illness payouts?";
      } else if (scenario === "hospitalised") {
        promptText = "I've been hospitalised. What is my room & board limit, co-payment, or daily benefit?";
      } else if (scenario === "custom") {
        // Custom scenario — don't auto-send, just greet and wait for user input
        if (documentId) {
          fetch(`/api/documents`)
            .then(res => res.json())
            .then(data => {
              const doc = data.documents?.find((d: DBDoc) => d.id === documentId);
              const docName = doc ? doc.name : "your document";
              setMessages([{
                id: "system-greet",
                role: "assistant",
                content: `Hi! I've loaded "${docName}". Ask me anything about your policy — coverage, exclusions, what's covered in different situations, anything you'd like to know.`,
                timestamp: new Date(),
              }]);
            })
            .catch(() => {
              setMessages([{
                id: "system-greet",
                role: "assistant",
                content: `Hi! Ask me anything about your policy — coverage, exclusions, what's covered in different situations, anything you'd like to know.`,
                timestamp: new Date(),
              }]);
            });
        }
        setHasInitializedScenario(true);
        return;
      }

      if (promptText) {
        if (documentId) {
          fetch(`/api/documents`)
            .then(res => res.json())
            .then(data => {
              const doc = data.documents?.find((d: DBDoc) => d.id === documentId);
              const docName = doc ? doc.name : "your document";
              
              const systemGreeting: Message = {
                id: "system-greet",
                role: "assistant",
                content: `Using "${docName}" as context. Analyzing scenario...`,
                timestamp: new Date()
              };

              const userMessage: Message = {
                id: "scenario-user-prompt",
                role: "user",
                content: promptText,
                timestamp: new Date(),
              };

              setMessages([systemGreeting, userMessage]);
              sendChatMessage([userMessage]);
            })
            .catch((err) => {
              console.error(err);
              const userMessage: Message = {
                id: "scenario-user-prompt",
                role: "user",
                content: promptText,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, userMessage]);
              sendChatMessage([userMessage]);
            });
        }
      }
    } else if (documentId && !hasInitializedScenario) {
      // Just a document selected but no specific scenario
      setTimeout(() => {
        setHasInitializedScenario(true);
      }, 0);
      
      fetch(`/api/documents`)
        .then(res => res.json())
        .then(data => {
          const doc = data.documents?.find((d: DBDoc) => d.id === documentId);
          if (doc) {
            setMessages([
              {
                id: "1",
                role: "assistant",
                content: `Hello! I've loaded "${doc.name}" as context. What would you like to know about this policy?`,
                timestamp: new Date(),
              }
            ]);
          }
        })
        .catch(err => console.error(err));
    }
  }, [scenario, documentId, hasInitializedScenario, sendChatMessage]);

  const handleSendMessage = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    sendChatMessage(updatedMessages);
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-[10px] mt-1 opacity-60">
                {message.timestamp.getHours().toString().padStart(2, '0')}:{message.timestamp.getMinutes().toString().padStart(2, '0')}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary.base }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="softui-card text-gray-900 max-w-[75%] rounded-2xl px-4 py-3 flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">Gemini is thinking...</span>
            </div>
          </div>
        )}
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
            disabled={isTyping}
            placeholder={isTyping ? "Please wait..." : "Type a message..."}
            className="flex-1 bg-transparent outline-none text-sm px-3 py-2 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
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

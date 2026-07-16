"use client";

import { useState } from "react";
import { ThumbsUp, MessageSquareHeart, X, Send } from "lucide-react";
import { colors } from "@/lib/design-system";

interface FeedbackWidgetProps {
  page: string;
}

export default function FeedbackWidget({ page }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [likelihood, setLikelihood] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page,
          likelihood,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage("");
        setLikelihood(null);
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2 group">
        <div className="hidden md:block softui-card px-4 py-2 text-sm font-medium text-gray-900 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          Help us make ScanTell smarter ✨
        </div>
        <div className="md:hidden softui-card px-4 py-2 text-sm font-medium text-gray-900 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          Help us grow ✨
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          style={{ 
            background: colors.primary.gradient,
            boxShadow: colors.shadows.gold
          }}
          aria-label="Give feedback"
        >
          <MessageSquareHeart className="w-6 h-6 text-gray-900" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80">
      <div className="softui-card p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-green-100">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-gray-900 font-medium">Thank you!</p>
            <p className="text-gray-600 text-sm">Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How likely are you to keep using this app?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setLikelihood(value)}
                    className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                      likelihood === value
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is one thing we could improve to make this app more useful for you?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what we could improve..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || loading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ 
                background: colors.primary.gradient,
                boxShadow: colors.shadows.gold,
                color: colors.text.primary
              }}
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

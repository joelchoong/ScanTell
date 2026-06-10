"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { colors } from "@/lib/design-system";

const faqs = [
  {
    question: "What is ScanTell?",
    answer: "ScanTell is a document scanning and management application that helps you digitize, organize, and access your documents from anywhere."
  },
  {
    question: "How do I scan a document?",
    answer: "You can scan documents by using your device's camera or uploading existing files. The app will automatically process and organize your documents."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. Your documents are encrypted and stored securely. We use industry-standard security measures to protect your data."
  },
  {
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account at any time from the settings page. This will anonymize your personal information while retaining your document data for compliance purposes."
  },
  {
    question: "How do I change my password?",
    answer: "You can change your password from the settings page. Navigate to Settings → Change Password and follow the instructions."
  },
  {
    question: "What file formats are supported?",
    answer: "We support various file formats including PDF, JPG, PNG, and more. Check the upload section for the complete list of supported formats."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      {/* S-curve pattern at top */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        {/* Header with back arrow and centered title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#121417" }}>FAQ</h1>
          <div className="w-6" /> {/* Spacer to center the title */}
        </div>

        <div className="space-y-6">
          <p className="text-sm" style={{ color: "#23262B" }}>Find answers to common questions about ScanTell.</p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="softui-card overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold" style={{ color: "#121417" }}>{faq.question}</h3>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === index ? 'rotate-90' : ''}`} />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm" style={{ color: "#23262B" }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

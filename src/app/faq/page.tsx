"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { colors } from "@/lib/design-system";

const faqs = [
  {
    question: "What is ScanTell?",
    answer: "ScanTell lets you upload insurance documents and explore real-life scenarios based on your actual policy. Instead of reading through dense policy text, you can ask questions like 'What happens if I'm hospitalised?' and get plain-English answers directly from your document."
  },
  {
    question: "How do I upload a document?",
    answer: "From the dashboard, tap 'Upload PDF Document'. Only PDF files are supported, up to 5MB. Once uploaded, ScanTell will analyse the document and generate relevant scenarios for you to explore."
  },
  {
    question: "Is my data secure?",
    answer: "Your documents are stored on Vercel Blob with encryption at rest and TLS in transit. Your data is scoped to your account — only you can access your documents. Note that document text is processed by Google Gemini to generate answers; Google's standard data handling policies apply."
  },
  {
    question: "Can I delete my account?",
    answer: "Yes. Go to Profile → Settings → Delete Account. This permanently removes your account and all associated documents."
  },
  {
    question: "How do I change my password?",
    answer: "Go to Profile → Settings → Change Password and follow the steps there."
  },
  {
    question: "What file formats are supported?",
    answer: "Currently PDF only, up to 5MB per file. Support for additional formats may be added in future."
  },
  {
    question: "Why does my document say 'Not an insurance document'?",
    answer: "ScanTell is designed specifically for insurance policies. If you upload a different type of document (invoices, contracts, etc.), the AI will flag it. Try uploading an insurance policy document to explore scenarios."
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

import Link from "next/link";
import { colors, typography } from "@/lib/design-system";
import { FileText, Shield, Sparkles, ArrowRight, Upload, CheckCircle, Zap, Lock } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: colors.background.base }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[50vh] z-0 pointer-events-none">
          <Image
            src="/wave-pattern.svg"
            alt="Wave pattern"
            fill
            className="object-cover opacity-70"
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Side - Hero Content */}
            <div>
              <div className="mb-6">
                <Image
                  src="/scantell-logo-horizontal.svg"
                  alt="ScanTell"
                  width={200}
                  height={50}
                  priority
                />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Understand Any Document
                <span style={{ color: colors.primary.dark }}> in Seconds</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Upload any document and instantly explore scenarios, understand complex terms, and get clear answers to your questions using AI.
                <span className="block mt-2 text-sm text-gray-500">* Beta launch focused on insurance documents</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{ 
                    background: colors.primary.gradient, 
                    boxShadow: colors.shadows.gold,
                    color: colors.text.primary
                  }}
                >
                  Get Started Free
                </Link>
                
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:opacity-90"
                  style={{ 
                    background: 'white',
                    boxShadow: colors.shadows.raised,
                    color: colors.text.primary
                  }}
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Side - Launch Video */}
            <div className="softui-card p-4 overflow-hidden">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 relative">
                <video
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/wave-pattern.svg"
                >
                  <source src="/ScanTell Launch.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="softui-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${colors.primary.base}25` }}>
                <Upload className="w-8 h-8" style={{ color: colors.primary.dark }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload any document and get AI-powered analysis in seconds. No manual reading required.
              </p>
            </div>

            <div className="softui-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${colors.primary.base}25` }}>
                <Sparkles className="w-8 h-8" style={{ color: colors.primary.dark }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scenario Exploration</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore "what if" scenarios and get instant answers to complex questions about your document.
              </p>
            </div>

            <div className="softui-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${colors.primary.base}25` }}>
                <Shield className="w-8 h-8" style={{ color: colors.primary.dark }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clear Explanations</h3>
              <p className="text-gray-600 leading-relaxed">
                Complex terms translated into plain English. Understand exactly what your documents mean.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl" style={{ background: colors.primary.gradient }}>
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document</h3>
                <p className="text-gray-600">Upload any document as a PDF or image</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl" style={{ background: colors.primary.gradient }}>
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">Our AI extracts and analyzes your document</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl" style={{ background: colors.primary.gradient }}>
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Scenarios</h3>
                <p className="text-gray-600">Ask questions and explore scenarios</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="softui-card p-10 mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why ScanTell?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primary.dark }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Save Time</h4>
                  <p className="text-gray-600 text-sm">No more reading through 50+ page policy documents</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primary.dark }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Avoid Surprises</h4>
                  <p className="text-gray-600 text-sm">Know exactly what's covered before you need it</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primary.dark }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Answers</h4>
                  <p className="text-gray-600 text-sm">Get answers to complex questions in seconds</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primary.dark }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
                  <p className="text-gray-600 text-sm">Your documents are encrypted and never shared</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Understand Your Insurance?</h2>
            <p className="text-xl text-gray-600 mb-10">Join thousands of users who have simplified their insurance understanding</p>
            
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
              style={{ 
                background: colors.primary.gradient, 
                boxShadow: colors.shadows.gold,
                color: colors.text.primary
              }}
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2026 ScanTell by Innovia AI Technologies. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { memo, useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { colors, typography } from "@/lib/design-system";
import { Upload, Loader2 } from "lucide-react";
import { Toast, ToastType } from "@/shared/components/Toast";
import { useCallback } from "react";

interface ToastState { message: string; type: ToastType }

function HeroCardComponent() {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    import("../../../../public/lottie.json").then((module) => {
      setAnimationData(module.default);
    });
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so the same file can be re-selected
    e.target.value = "";

    if (!file) return;

    // Client-side PDF check
    if (file.type !== "application/pdf") {
      setToast({ message: "Only PDF files are supported.", type: "error" });
      return;
    }

    // Client-side size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "File must be under 5MB.", type: "error" });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error || "Upload failed.", type: "error" });
        return;
      }

      setToast({ message: `${file.name} uploaded successfully.`, type: "success" });
      // Dispatch event so UploadedDocuments refreshes
      window.dispatchEvent(new Event("document-uploaded"));
    } catch {
      setToast({ message: "Upload failed. Please try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="rounded-[2rem] p-8 relative overflow-hidden shadow-sm min-h-[420px] flex flex-col"
      style={{ backgroundColor: colors.background.base }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      {/* Header */}
      <div className="relative z-10 text-left mb-4">
        <h1 className={`${typography.heroTitle} text-gray-900`}>
          Understand today.<br />
          Anticipate <span style={{ color: colors.primary.base }}>tomorrow</span>
        </h1>
      </div>

      {/* Lottie animation */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px]">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>

      {/* Upload CTA */}
      <div className="relative z-10 text-left mt-auto flex justify-start">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className={`transition-colors text-black ${typography.button} px-8 py-4 rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
          style={{
            background: colors.primary.gradient,
            boxShadow: colors.shadows.gold,
          }}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Upload PDF Document</>          )}
        </button>
      </div>
    </div>
  );
}

export const HeroCard = memo(HeroCardComponent);

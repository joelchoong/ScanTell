"use client";

import { memo, useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { colors, typography } from "@/lib/design-system";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { documentsService } from "@/lib/services/documentsService";

function HeroCardComponent() {
  const [animationData, setAnimationData] = useState<any>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Lazy load the Lottie animation
    import("../../../../public/lottie.json").then((module) => {
      setAnimationData(module.default);
    });
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create object URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // Add document to service
      await documentsService.add({
        name: file.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        fileUrl: fileUrl,
      });
      
      // Navigate to explore page with file info
      router.push(`/explore?file=${encodeURIComponent(file.name)}&url=${encodeURIComponent(fileUrl)}`);
    }
  };

  return (
      <div
        className="rounded-[2rem] p-8 relative overflow-hidden shadow-sm min-h-[420px] flex flex-col"
        style={{ backgroundColor: colors.background.base }}
      >
      {/* Header at top left */}
      <div className="relative z-10 text-left mb-4">
        <h1 className={`${typography.heroTitle} text-gray-900`}>
          Understand today.<br />
          Anticipate <span style={{ color: colors.primary.base }}>tomorrow</span>
        </h1>
      </div>

      {/* Lottie animation middle right */}
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

      {/* CTA Button below animation */}
      <div className="relative z-10 text-left mt-auto flex justify-start">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          capture="environment"
        />
        <button
          onClick={handleUploadClick}
          className={`transition-colors text-black ${typography.button} px-8 py-4 rounded-full flex items-center justify-center hover:opacity-90`}
          style={{
            background: colors.primary.gradient,
            boxShadow: colors.shadows.gold
          }}
        >
          <Upload className="w-4 h-4 mr-2" /> Upload documents
        </button>
      </div>
    </div>
  );
}

export const HeroCard = memo(HeroCardComponent);
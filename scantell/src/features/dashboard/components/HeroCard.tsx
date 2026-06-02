"use client";

import { memo, useState, useEffect } from "react";
import Lottie from "lottie-react";
import { colors, typography } from "@/lib/design-system";
import { Upload } from "lucide-react";

function HeroCardComponent() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Lazy load the Lottie animation
    import("../../../../public/lottie.json").then((module) => {
      setAnimationData(module.default);
    });
  }, []);

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
        <button
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
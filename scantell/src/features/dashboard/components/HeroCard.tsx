"use client";

import Lottie from "lottie-react";
import lottieAnimation from "../../../../public/lottie.json";
import { colors, typography } from "@/lib/design-system";

export function HeroCard() {
  return (
    <div className="rounded-[2rem] p-7 relative overflow-hidden shadow-sm min-h-[300px]" style={{ backgroundColor: colors.background.base }}>
      {/* Header at top left */}
      <div className="relative z-10 text-left mb-4">
        <h1 className={`${typography.heroTitle} text-gray-900`}>
          Understand today.<br />
          Anticipate <span style={{ color: colors.primary.base }}>tomorrow</span>
        </h1>
      </div>

      {/* Lottie animation in bottom right */}
      <div className="absolute -bottom-20 -right-20 w-[360px] h-[360px]">
        <Lottie
          animationData={lottieAnimation}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

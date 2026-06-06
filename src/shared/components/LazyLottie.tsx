"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import type { LottieComponentProps, LottieRefCurrentProps } from "lottie-react";

const Lottie = dynamic<LottieComponentProps>(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

interface LazyLottieProps extends HTMLAttributes<HTMLDivElement> {
  path: string;
  speed?: number;
  lottieClassName?: string;
  lottieStyle?: CSSProperties;
}

export function LazyLottie({
  path,
  speed = 1,
  className,
  style,
  lottieClassName,
  lottieStyle,
  ...props
}: LazyLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || animationData) return;

    let isMounted = true;

    fetch(path, { cache: "force-cache" })
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch(() => {
        if (isMounted) setAnimationData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [animationData, path, shouldLoad]);

  useEffect(() => {
    lottieRef.current?.setSpeed(speed);
  }, [animationData, speed]);

  return (
    <div ref={containerRef} className={className} style={style} {...props}>
      {animationData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          autoplay
          onDOMLoaded={() => lottieRef.current?.setSpeed(speed)}
          className={lottieClassName}
          style={lottieStyle}
        />
      ) : null}
    </div>
  );
}

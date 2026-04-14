"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ColorVariant = "orange" | "green" | "ghost";

interface ShinyButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ColorVariant;
  href?: string;
}

const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  orange: {
    outer: "bg-gradient-to-b from-[#7A3800] to-[#F8A96B]",
    inner: "bg-gradient-to-b from-[#FFD4A8] via-[#C45C00] to-[#FFB87A]",
    button: "bg-gradient-to-b from-[#F87B31] to-[#C45500]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(120_50_0_/_80%)]",
  },
  green: {
    outer: "bg-gradient-to-b from-[#0D3320] to-[#5BAD6F]",
    inner: "bg-gradient-to-b from-[#C8EDCF] via-[#1A5C32] to-[#A8DFB5]",
    button: "bg-gradient-to-b from-[#2D6444] to-[#1A3D28]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(15_50_30_/_80%)]",
  },
  ghost: {
    outer: "bg-gradient-to-b from-[#ffffff15] to-[#ffffff30]",
    inner: "bg-gradient-to-b from-[#ffffff20] via-[#ffffff10] to-[#ffffff25]",
    button: "bg-gradient-to-b from-[#ffffff18] to-[#ffffff08]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]",
  },
};

const ShineEffect = ({ isPressed }: { isPressed: boolean }) => (
  <div
    className={cn(
      "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300 rounded-md",
      isPressed ? "opacity-30" : "opacity-0"
    )}
  >
    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white to-transparent" />
  </div>
);

export const ShinyButton = React.forwardRef<HTMLAnchorElement, ShinyButtonProps>(
  ({ children, className, variant = "orange", href, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isTouchDevice, setIsTouchDevice] = React.useState(false);

    React.useEffect(() => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    const colors = colorVariants[variant];
    const transitionStyle = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";

    const wrapperStyle: React.CSSProperties = {
      transform: isPressed ? "translateY(2px) scale(0.99)" : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(0,0,0,0.2)"
        : isHovered && !isTouchDevice
        ? "0 6px 18px rgba(0,0,0,0.18)"
        : "0 3px 10px rgba(0,0,0,0.12)",
      transition: transitionStyle,
    };

    const buttonStyle: React.CSSProperties = {
      transform: isPressed ? "scale(0.97)" : "scale(1)",
      filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.08)" : "none",
      transition: transitionStyle,
    };

    return (
      <div
        className={cn(
          "relative inline-flex transform-gpu rounded-xl p-[1.5px] will-change-transform cursor-pointer",
          colors.outer,
          className
        )}
        style={wrapperStyle}
      >
        {/* Inner glow ring */}
        <div
          className={cn(
            "absolute inset-[1px] rounded-xl will-change-transform",
            colors.inner
          )}
          style={{
            filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.05)" : "none",
            transition: transitionStyle,
          }}
        />
        {/* Clickable anchor */}
        <a
          ref={ref}
          href={href}
          className={cn(
            "relative z-10 m-[1px] inline-flex items-center justify-center gap-2",
            "rounded-xl px-8 py-4 text-base font-bold leading-none select-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
            colors.button,
            colors.textColor,
            colors.textShadow
          )}
          style={buttonStyle}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
          onMouseLeave={() => { setIsPressed(false); setIsHovered(false); }}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onTouchCancel={() => setIsPressed(false)}
          {...props}
        >
          <ShineEffect isPressed={isPressed} />
          {children}
          {isHovered && !isPressed && !isTouchDevice && (
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/8" />
          )}
        </a>
      </div>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

import { useRef, useEffect, useCallback, ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface MagicBentoCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  enableSpotlight?: boolean;
  enableParticles?: boolean;
  glowColor?: string; // "r, g, b"
  onClick?: () => void;
}

/**
 * MagicBentoCard — premium card wrapper with:
 * - cursor spotlight (radial glow following the mouse)
 * - 3D tilt
 * - subtle magnetism
 * - floating particles on hover
 * Uses HSL design tokens for the base look; glow color is overridable.
 */
export const MagicBentoCard = ({
  children,
  className,
  enableTilt = true,
  enableMagnetism = true,
  enableSpotlight = true,
  enableParticles = true,
  glowColor = "0, 217, 255",
  onClick,
}: MagicBentoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const particleLayerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);

  const spawnParticles = useCallback(() => {
    if (!enableParticles || !particleLayerRef.current) return;
    const layer = particleLayerRef.current;
    const { width, height } = layer.getBoundingClientRect();
    const count = 8;
    for (let i = 0; i < count; i++) {
      const id = window.setTimeout(() => {
        const p = document.createElement("span");
        p.style.cssText = `
          position:absolute;
          width:4px;height:4px;border-radius:9999px;
          left:${Math.random() * width}px;
          top:${Math.random() * height}px;
          background:rgba(${glowColor},0.9);
          box-shadow:0 0 8px rgba(${glowColor},0.8), 0 0 16px rgba(${glowColor},0.4);
          pointer-events:none;
        `;
        layer.appendChild(p);
        gsap.to(p, {
          y: -30 - Math.random() * 30,
          opacity: 0,
          scale: 0.4,
          duration: 1.4,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }, i * 80);
      timeoutsRef.current.push(id);
    }
  }, [enableParticles, glowColor]);

  const clearParticleTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      if (enableSpotlight && spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(${glowColor},0.18), transparent 60%)`;
        spotlightRef.current.style.opacity = "1";
      }

      if (enableTilt) {
        const rx = ((y - cy) / cy) * -6;
        const ry = ((x - cx) / cx) * 6;
        gsap.to(el, { rotateX: rx, rotateY: ry, duration: 0.4, ease: "power2.out", transformPerspective: 1000 });
      }

      if (enableMagnetism) {
        const mx = ((x - cx) / cx) * 4;
        const my = ((y - cy) / cy) * 4;
        gsap.to(el, { x: mx, y: my, duration: 0.4, ease: "power2.out" });
      }
    };

    const handleEnter = () => {
      spawnParticles();
    };

    const handleLeave = () => {
      clearParticleTimeouts();
      if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.5, ease: "power2.out" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      clearParticleTimeouts();
    };
  }, [enableTilt, enableMagnetism, enableSpotlight, glowColor, spawnParticles, clearParticleTimeouts]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "relative glass-panel rounded-2xl overflow-hidden will-change-transform cursor-pointer transition-shadow duration-300 hover:shadow-glow",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {enableSpotlight && (
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      {enableParticles && (
        <div
          ref={particleLayerRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface MagicBentoGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Grid wrapper that adds a global cursor-following spotlight across all cards.
 */
export const MagicBentoGrid = ({ children, className }: MagicBentoGridProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{
        backgroundImage:
          "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.06), transparent 40%)",
      }}
    >
      {children}
    </div>
  );
};

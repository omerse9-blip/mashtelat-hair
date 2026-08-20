"use client";

import { useEffect, useRef } from "react";

export default function ParallaxHero({ children, imageUrl }) {
  const outerRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const bg = bgRef.current;
    if (!outer || !bg) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const speedFactor = isMobile ? 0.25 : 0.5;

    const update = () => {
      const rect = outer.getBoundingClientRect();
      const scrolledPast = -rect.top;
      const offset = scrolledPast * speedFactor;
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    if (prefersReduced) {
      bg.style.transform = "none";
      return;
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={outerRef} className="parallax-hero">
      <div
        ref={bgRef}
        className="parallax-hero-bg"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="parallax-hero-scrim" />
      <div className="parallax-hero-content">{children}</div>

      <style>{`
        .parallax-hero {
          position: relative;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          height: min(64vh, 557px);
          min-height: 348px;
          overflow: hidden;
          margin-top: -36px;
        }
        .parallax-hero-bg {
          position: absolute;
          inset: -10% 0;
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          will-change: transform;
          opacity: 0.9;
        }
        .parallax-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.12) 0%,
            rgba(31, 42, 36, 0) 40%,
            rgba(31, 42, 36, 0) 68%,
            var(--bg) 100%
          );
          pointer-events: none;
        }
        .parallax-hero-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 24px 24px;
        }
        @media (max-width: 640px) {
          .parallax-hero {
            height: min(50vh, 400px);
          }
        }
      `}</style>
    </div>
  );
}

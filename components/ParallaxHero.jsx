"use client";

import { useEffect, useRef } from "react";

export default function ParallaxHero({ children }) {
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
        style={{ backgroundImage: "url(/hero-nursery.jpg)" }}
      />
      <div className="parallax-hero-scrim" />
      <div className="parallax-hero-content">
        <div className="parallax-hero-card">{children}</div>
      </div>

      <style>{`
        .parallax-hero {
          position: relative;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          height: min(74vh, 640px);
          min-height: 400px;
          overflow: hidden;
          margin-top: -36px;
        }
        .parallax-hero-bg {
          position: absolute;
          inset: -35% 0;
          background-size: cover;
          background-position: center 35%;
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
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .parallax-hero-card {
          background: rgba(247, 242, 233, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 22px;
          padding: 31px 36px 27px;
          box-shadow: 0 12px 40px rgba(31, 42, 36, 0.2);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          transform: scale(0.9);
        }
        @media (max-width: 640px) {
          .parallax-hero {
            height: min(58vh, 460px);
          }
          .parallax-hero-card {
            padding: 23px 22px 20px;
            border-radius: 16px;
            gap: 9px;
            background: rgba(247, 242, 233, 0.75);
            transform: scale(1.17);
          }
        }
      `}</style>
    </div>
  );
}

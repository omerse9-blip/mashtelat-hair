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

    const update = () => {
      const rect = outer.getBoundingClientRect();
      const scrolledPast = -rect.top; // חיובי ברגע שהחלק העליון של ה-hero חצה את חלק המסך
      const offset = scrolledPast * 0.35;
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
          height: min(58vh, 480px);
          min-height: 340px;
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
        }
        .parallax-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.15) 0%,
            rgba(31, 42, 36, 0.05) 55%,
            rgba(31, 42, 36, 0.22) 100%
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
          background: rgba(247, 242, 233, 0.88);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 22px 32px 20px;
          box-shadow: 0 8px 30px rgba(31, 42, 36, 0.18);
          text-align: center;
        }
        @media (max-width: 640px) {
          .parallax-hero {
            height: min(50vh, 400px);
          }
          .parallax-hero-card {
            padding: 16px 22px 14px;
          }
        }
      `}</style>
    </div>
  );
}

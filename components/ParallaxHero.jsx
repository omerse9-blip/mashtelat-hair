"use client";

import { useEffect, useRef } from "react";

export default function ParallaxHero({ children }) {
  const outerRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const layer = layerRef.current;
    if (!outer || !layer) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;

    const update = () => {
      const rect = outer.getBoundingClientRect();
      const scrolledPast = -rect.top;
      const offset = scrolledPast * 0.35;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    if (prefersReduced) {
      layer.style.transform = "none";
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
      <div ref={layerRef} className="parallax-hero-layer">
        <div
          className="parallax-hero-blur"
          style={{ backgroundImage: "url(/hero-nursery.jpg)" }}
        />
        <div
          className="parallax-hero-sharp"
          style={{ backgroundImage: "url(/hero-nursery.jpg)" }}
        />
      </div>
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
          background: #2c352e;
        }
        .parallax-hero-layer {
          position: absolute;
          inset: -35% 0;
          will-change: transform;
        }
        .parallax-hero-blur {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 35%;
          background-repeat: no-repeat;
          filter: blur(50px) saturate(1.15) brightness(0.9);
          transform: scale(1.25);
        }
        .parallax-hero-sharp {
          position: absolute;
          inset: 0;
          background-size: contain;
          background-position: center 35%;
          background-repeat: no-repeat;
        }
        .parallax-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.1) 0%,
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
          border-radius: 24px;
          padding: 34px 40px 30px;
          box-shadow: 0 12px 40px rgba(31, 42, 36, 0.25);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          min-width: min(78vw, 300px);
          max-width: 380px;
        }
        @media (max-width: 640px) {
          .parallax-hero {
            height: min(58vh, 460px);
          }
          .parallax-hero-card {
            padding: 26px 24px 22px;
            border-radius: 18px;
            gap: 10px;
            min-width: min(84vw, 280px);
          }
        }
      `}</style>
    </div>
  );
}

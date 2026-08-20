"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function ParallaxHero({ children }) {
  const imgWrapRef = useRef(null);

  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;

    const update = () => {
      const rect = el.parentElement.getBoundingClientRect();
      const offset = rect.top * 0.35;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="parallax-hero">
      <div ref={imgWrapRef} className="parallax-hero-img">
        <Image
          src="/hero-nursery.jpg"
          alt="צמחים במשתלת העיר"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
      </div>
      <div className="parallax-hero-fade" />
      <div className="parallax-hero-content">{children}</div>

      <style>{`
        .parallax-hero {
          position: relative;
          width: 100%;
          height: min(62vh, 520px);
          min-height: 320px;
          overflow: hidden;
          margin-top: -24px;
        }
        .parallax-hero-img {
          position: absolute;
          inset: -20% 0;
          will-change: transform;
        }
        .parallax-hero-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.28) 0%,
            rgba(31, 42, 36, 0.05) 45%,
            var(--bg) 96%
          );
          pointer-events: none;
        }
        .parallax-hero-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 28px;
          text-align: center;
        }
        @media (max-width: 640px) {
          .parallax-hero {
            height: min(52vh, 420px);
          }
        }
      `}</style>
    </div>
  );
}

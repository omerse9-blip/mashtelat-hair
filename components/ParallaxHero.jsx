"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function ParallaxHero() {
  const outerRef = useRef(null);
  const imgWrapRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const imgWrap = imgWrapRef.current;
    if (!outer || !imgWrap) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;

    const update = () => {
      const rect = outer.getBoundingClientRect();
      // כשה-hero גולל אל מחוץ למסך כלפי מעלה, rect.top הופך לשלילי.
      // מזיזים את התמונה כלפי מטה ביחס לתוכן ב-40% מהמהירות, כדי שתיראה "נגררת מאחור".
      const scrolledPast = Math.max(0, -rect.top);
      const offset = scrolledPast * 0.4;
      imgWrap.style.transform = `translate3d(0, ${offset}px, 0)`;
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
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={outerRef} className="parallax-hero">
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

      <style>{`
        .parallax-hero {
          position: relative;
          width: 100%;
          height: min(48vh, 380px);
          min-height: 240px;
          overflow: hidden;
          margin-top: -24px;
        }
        .parallax-hero-img {
          position: absolute;
          inset: -30% 0;
          will-change: transform;
        }
        .parallax-hero-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.12) 0%,
            rgba(31, 42, 36, 0) 55%,
            var(--bg) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

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
        className="parallax-hero-bg

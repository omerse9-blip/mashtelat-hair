"use client";

import { useEffect, useRef, useState } from "react";

export default function ParallaxHero({ children, imageUrl, mediaType = "image" }) {
  const outerRef = useRef(null);
  const bgRef = useRef(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(true);
  const isVideo = mediaType === "video";

  useEffect(() => {
    const outer = outerRef.current;
    const bg = bgRef.current;
    if (!outer || !bg) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // תנועה כבויה: לפי הגדרת המערכת או לפי כפתור "עצירת תנועה" בסרגל הנגישות
    const motionOff = () =>
      reducedQuery.matches || document.documentElement.getAttribute("data-a11y-motion") === "off";

    let ticking = false;

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const speedFactor = isMobile ? 0.25 : 0.5;

    const update = () => {
      if (motionOff()) {
        bg.style.transform = "none";
        ticking = false;
        return;
      }
      const rect = outer.getBoundingClientRect();
      const scrolledPast = -rect.top;
      const offset = scrolledPast * speedFactor;
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    const syncVideo = () => {
      if (!isVideo || typeof bg.pause !== "function") return;
      if (motionOff()) {
        bg.pause();
      } else if (!userPausedRef.current) {
        const p = bg.play();
        if (p && p.catch) p.catch(() => {});
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    const onMotionChange = () => {
      update();
      syncVideo();
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    update();
    syncVideo();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("a11y-motion-change", onMotionChange);
    if (reducedQuery.addEventListener) reducedQuery.addEventListener("change", onMotionChange);
    if (isVideo) {
      bg.addEventListener("play", onPlay);
      bg.addEventListener("pause", onPause);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.removeEventListener("a11y-motion-change", onMotionChange);
      if (reducedQuery.removeEventListener) reducedQuery.removeEventListener("change", onMotionChange);
      if (isVideo) {
        bg.removeEventListener("play", onPlay);
        bg.removeEventListener("pause", onPause);
      }
    };
  }, [isVideo]);

  function toggleVideo() {
    const v = bgRef.current;
    if (!v || typeof v.pause !== "function") return;
    if (v.paused) {
      userPausedRef.current = false;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      userPausedRef.current = true;
      v.pause();
    }
  }

  return (
    <div ref={outerRef} className="parallax-hero">
      {isVideo ? (
        <video
          ref={bgRef}
          className="parallax-hero-bg parallax-hero-video"
          src={imageUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : (
        <div
          ref={bgRef}
          className="parallax-hero-bg"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="parallax-hero-scrim" />
      <div className="parallax-hero-content">{children}</div>

      {isVideo ? (
        <button
          type="button"
          className="parallax-hero-toggle"
          onClick={toggleVideo}
          aria-label={playing ? "השהיית סרטון הרקע" : "הפעלת סרטון הרקע"}
        >
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
        </button>
      ) : null}

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
        .parallax-hero-video {
          width: 100%;
          height: 120%;
          object-fit: cover;
          object-position: center center;
        }
        .parallax-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(31, 42, 36, 0.12) 0%,
            rgba(31, 42, 36, 0) 40%,
            rgba(31, 42, 36, 0) 74%,
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
        .parallax-hero-toggle {
          position: absolute;
          bottom: 14px;
          inset-inline-start: 14px;
          z-index: 2;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 2px solid #fff;
          background: rgba(31, 42, 36, 0.85);
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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

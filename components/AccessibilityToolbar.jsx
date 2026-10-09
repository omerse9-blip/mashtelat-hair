"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { A11Y_KEY } from "../lib/a11yInit";

const DEFAULTS = { zoom: 0, contrast: false, links: false, font: false, motion: false };
const ZOOM_LABELS = ["גודל רגיל", "115%", "130%"];
const MAX_ZOOM = ZOOM_LABELS.length - 1;

function applyPrefs(p) {
  const h = document.documentElement;
  if (p.zoom > 0) h.setAttribute("data-a11y-zoom", String(p.zoom));
  else h.removeAttribute("data-a11y-zoom");
  h.classList.toggle("a11y-contrast", !!p.contrast);
  h.classList.toggle("a11y-links", !!p.links);
  h.classList.toggle("a11y-font", !!p.font);
  if (p.motion) h.setAttribute("data-a11y-motion", "off");
  else h.removeAttribute("data-a11y-motion");
  window.dispatchEvent(new Event("a11y-motion-change"));
}

function AccessibilityIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M4 8.5c0-.6.5-1 1-1h14c.6 0 1 .5 1 1s-.5 1-1 1h-5v3.2l2.3 6.6c.2.6-.1 1.2-.7 1.4-.6.2-1.2-.1-1.4-.7L12 14.6l-1.2 3.4c-.2.6-.8.9-1.4.7-.6-.2-.9-.8-.7-1.4l2.3-6.6V9.5H5c-.5 0-1-.4-1-1z" />
    </svg>
  );
}

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULTS);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(A11Y_KEY);
      if (raw) {
        const saved = { ...DEFAULTS, ...JSON.parse(raw) };
        setPrefs(saved);
        applyPrefs(saved);
      }
    } catch (e) { /* אחסון חסום, ממשיכים בלי שמירה */ }
  }, []);

  // סגירה ב-Esc והחזרת הפוקוס לכפתור הפתיחה; פוקוס לכפתור הראשון בפתיחה
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector("button:not([disabled])");
      if (first) first.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function update(patch) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(next)); } catch (e) { /* מתעלמים */ }
  }

  function reset() {
    setPrefs(DEFAULTS);
    applyPrefs(DEFAULTS);
    try { localStorage.removeItem(A11Y_KEY); } catch (e) { /* מתעלמים */ }
  }

  function toggle(label, key) {
    const on = !!prefs[key];
    return (
      <button
        type="button"
        className="a11y-opt"
        aria-pressed={on}
        onClick={() => update({ [key]: !on })}
      >
        {on ? "✓ " : ""}{label}
      </button>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="a11y-fab"
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <AccessibilityIcon />
      </button>

      {open ? (
        <div id="a11y-panel" ref={panelRef} className="a11y-panel" role="dialog" aria-label="אפשרויות נגישות">
          <h2>אפשרויות נגישות</h2>

          <div className="a11y-grid">
            <button
              type="button"
              className="a11y-opt"
              onClick={() => update({ zoom: Math.min(MAX_ZOOM, prefs.zoom + 1) })}
              disabled={prefs.zoom >= MAX_ZOOM}
            >
              הגדלת טקסט
            </button>
            <button
              type="button"
              className="a11y-opt"
              onClick={() => update({ zoom: Math.max(0, prefs.zoom - 1) })}
              disabled={prefs.zoom <= 0}
            >
              הקטנת טקסט
            </button>
          </div>
          <p className="a11y-status" role="status">גודל טקסט: {ZOOM_LABELS[prefs.zoom] || ZOOM_LABELS[0]}</p>

          <div className="a11y-grid">
            {toggle("ניגודיות גבוהה", "contrast")}
            {toggle("הדגשת קישורים", "links")}
            {toggle("גופן קריא", "font")}
            {toggle("עצירת תנועה", "motion")}
          </div>

          <div className="a11y-footer">
            <button type="button" className="a11y-opt a11y-reset" onClick={reset}>איפוס הגדרות</button>
            <Link href="/accessibility" className="a11y-link" onClick={() => setOpen(false)}>הצהרת נגישות</Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

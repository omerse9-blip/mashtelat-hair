"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// נגישות לחלונות קופצים: מעביר פוקוס פנימה, לוכד את מקש Tab בתוך החלון,
// סוגר ב-Esc ומחזיר את הפוקוס לאלמנט שפתח את החלון
export default function useDialogA11y(active, containerRef, onEscape) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    const previous = document.activeElement;

    if (container) {
      const first = container.querySelector(FOCUSABLE);
      const target = first || container;
      if (target && target.focus) target.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") {
        if (escRef.current) escRef.current();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const nodes = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement
      );
      if (nodes.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      } else if (!container.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus && document.contains(previous)) previous.focus();
    };
  }, [active, containerRef]);
}

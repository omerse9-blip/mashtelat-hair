"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ nursery: [], garden: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  // כפתור "חזור" בטלפון סוגר את החיפוש במקום לצאת מהדף
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ search: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // חיפוש עם השהיה קצרה (debounce) כדי לא להעמיס בכל הקלדה
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults({ nursery: [], garden: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setResults(data && data.nursery ? data : { nursery: [], garden: [] });
      } catch {
        setResults({ nursery: [], garden: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  function openSearch() { setOpen(true); }

  function closeSearch() {
    if (window.history.state && window.history.state.search) {
      window.history.back();
    } else {
      setOpen(false);
    }
  }

  function goTo(href) {
    closeSearch();
    setQ("");
    router.push(href);
  }

  const total = results.nursery.length + results.garden.length;

  return (
    <>
      <button
        onClick={openSearch}
        aria-label="חיפוש"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)", background: "#fff", fontSize: 18, cursor: "pointer" }}
      >
        🔍
      </button>

      {open ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.98)", zIndex: 100, display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", padding: "18px 16px", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="חיפוש מוצר, צמח, מילה בתיאור..."
                style={{ flex: 1, fontSize: 17, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none" }}
              />
              <button
                onClick={closeSearch}
                aria-label="סגירה"
                style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid var(--line)", background: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {q.trim().length < 2 ? (
                <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>הקלידו לפחות שתי אותיות כדי לחפש</p>
              ) : loading ? (
                <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>מחפש...</p>
              ) : total === 0 ? (
                <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>לא נמצאו תוצאות עבור {`"${q.trim()}"`}</p>
              ) : (
                <>
                  {results.nursery.length > 0 ? (
                    <Section title="משתלה">
                      {results.nursery.map((r) => (
                        <ResultRow
                          key={`p-${r.id}`}
                          image={r.image}
                          title={r.name}
                          subtitle={`${r.categoryName}${r.price != null ? ` · ${r.multi ? "החל מ־" : ""}₪${r.price}` : ""}`}
                          fallback="🪴"
                          onClick={() => goTo(`/?cat=${encodeURIComponent(r.categoryId)}&focus=${encodeURIComponent(r.id)}`)}
                        />
                      ))}
                    </Section>
                  ) : null}

                  {results.garden.length > 0 ? (
                    <Section title="גינון">
                      {results.garden.map((r) => (
                        <ResultRow
                          key={`g-${r.id}`}
                          image={r.image}
                          title={r.caption || "פריט גינון"}
                          subtitle={r.categoryName}
                          fallback={r.mediaType === "video" ? "🎬" : "🌳"}
                          onClick={() => goTo(`/garden?cat=${encodeURIComponent(r.categoryId)}&focus=${encodeURIComponent(r.id)}`)}
                        />
                      ))}
                    </Section>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", letterSpacing: 1, marginBottom: 8 }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function ResultRow({ image, title, subtitle, onClick, fallback }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 12, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", textAlign: "start", width: "100%" }}
    >
      <div style={{ position: "relative", width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "#f4f6f4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
        {image ? <Image src={image} alt="" fill sizes="48px" style={{ objectFit: "cover" }} /> : <span>{fallback}</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
        {subtitle ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{subtitle}</p> : null}
      </div>
    </button>
  );
}

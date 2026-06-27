"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SearchOverlay({ index }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  const data = index && index.nursery ? index : { nursery: [], garden: [] };

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

  // נרמול: הסרת רווחים מיותרים ותווים נסתרים, השוואה ללא תלות ברישיות
  function norm(s) {
    return String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  const term = norm(q);

  const results = useMemo(() => {
    if (!term) return { nursery: [], garden: [] };
    const nursery = data.nursery.filter((p) =>
      norm(`${p.name || ""} ${p.desc || ""}`).includes(term)
    );
    const garden = data.garden.filter((w) =>
      norm(w.caption || "").includes(term)
    );
    return { nursery, garden };
  }, [data, term]);

  const total = results.nursery.length + results.garden.length;
  const sampleNames = data.nursery.map((p) => p.name).join(" | ");

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

            <div style={{ background: "#2f6b43", color: "#fff", textAlign: "center", padding: "8px 10px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              נטענו {data.nursery.length} מוצרים · {data.garden.length} גינון
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, wordBreak: "break-word" }}>
                שמות: {sampleNames || "(ריק)"}
              </div>
            </div>

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
              {!term ? (
                <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>התחילו להקליד כדי לחפש</p>
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

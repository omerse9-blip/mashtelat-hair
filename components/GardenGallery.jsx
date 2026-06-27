"use client";

import { useState } from "react";

const BOOK_URL = "https://ginun-haair.vercel.app/book";

export default function GardenGallery({ categories, worksByCat }) {
  const [activeId, setActiveId] = useState(categories[0]?.id || null);
  const [zoom, setZoom] = useState(null);

  const works = activeId ? (worksByCat[activeId] || []) : [];
  const images = works.filter((w) => w.media_type === "image");
  const videos = works.filter((w) => w.media_type === "video");

  const tabStyle = (active) => ({
    fontSize: 15, fontWeight: 600, padding: "9px 20px", borderRadius: 999, cursor: "pointer",
    background: active ? "var(--green)" : "#fff",
    color: active ? "#fff" : "var(--ink)",
    border: active ? "1px solid var(--green)" : "1px solid var(--line)",
  });

  const bookStyle = { display: "inline-block", background: "var(--green)", color: "#fff", fontSize: 17, fontWeight: 700, padding: "14px 36px", borderRadius: 999 };

  return (
    <div>
      {categories.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} style={tabStyle(c.id === activeId)}>
              {c.name}
            </button>
          ))}
        </div>
      ) : null}

      {works.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--line)", borderRadius: 16, color: "var(--muted)" }}>
          תוכן בהקמה — בקרוב יתווספו תמונות וסרטונים.
        </div>
      ) : (
        <div>
          {images.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18, marginBottom: videos.length ? 40 : 0 }}>
              {images.map((w) => (
                <figure key={w.id} style={{ margin: 0 }}>
                  <div onClick={() => setZoom(w.media_url)} style={{ aspectRatio: "4 / 3", borderRadius: 14, overflow: "hidden", background: "#f4f6f4", cursor: "zoom-in" }}>
                    <img src={w.media_url} alt={w.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  {w.caption ? <figcaption style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>{w.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : null}

          {videos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
              {videos.map((w) => (
                <figure key={w.id} style={{ margin: 0 }}>
                  <div style={{ aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", background: "#000" }}>
                    <iframe src={`https://www.youtube.com/embed/${w.media_url}`} title={w.caption || "video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} />
                  </div>
                  {w.caption ? <figcaption style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>{w.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 56 }}>
        <a href={BOOK_URL} style={bookStyle}>תיאום פגישה</a>
      </div>

      {zoom ? (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, cursor: "zoom-out" }}>
          <img src={zoom} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
        </div>
      ) : null}
    </div>
  );
}

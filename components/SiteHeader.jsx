"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";

export default function SiteHeader({ searchIndex, categories = [] }) {
  const pathname = usePathname();
  const isGarden = pathname.startsWith("/garden");
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    window.history.pushState({ menu: true }, "");
    const onPop = () => setMenuOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [menuOpen]);

  function closeMenu() {
    if (window.history.state && window.history.state.menu) {
      window.history.back();
    } else {
      setMenuOpen(false);
    }
  }

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="תפריט"
            style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, width: 42, height: 42, borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", padding: 0 }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>משתלת העיר</span>
            <span style={{ fontSize: 20 }}>🌿</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SearchOverlay index={searchIndex} />
          <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)", fontSize: 20 }} aria-label="עגלה">
            🛒
            {count > 0 ? (
              <span style={{ position: "absolute", top: -4, insetInlineEnd: -4, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: "var(--green)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <NavTab href="/" label="משתלה" active={!isGarden} />
          <NavTab href="/garden" label="גינון" active={isGarden} />
        </div>
      </div>

      {menuOpen ? (
        <div onClick={closeMenu} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(82vw, 320px)", maxHeight: "100vh", overflowY: "auto", background: "var(--card)", boxShadow: "0 0 40px rgba(0,0,0,0.3)", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 4 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>מחלקות</span>
              <button onClick={closeMenu} aria-label="סגירה" style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "var(--green-soft)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            {categories.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>אין מחלקות להצגה.</p>
            ) : (
              categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/?cat=${c.id}`}
                  onClick={closeMenu}
                  style={{ display: "block", padding: "12px 14px", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "var(--ink)", borderBottom: "1px solid var(--line)" }}
                >
                  {c.name}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavTab({ href, label, active }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 15,
        fontWeight: 600,
        padding: "8px 18px",
        borderRadius: 999,
        background: active ? "var(--green)" : "transparent",
        color: active ? "#fff" : "var(--ink)",
        border: active ? "1px solid var(--green)" : "1px solid var(--line)",
      }}
    >
      {label}
    </Link>
  );
}

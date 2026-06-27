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
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = "";
    };
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="תפריט"
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, width: 42, height: 42, borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", padding: 0 }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <NavTab href="/" label="משתלת העיר" active={!isGarden} />
            <NavTab href="/garden" label="גינון העיר" active={isGarden} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
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

      {menuOpen ? (
        <div
          onClick={closeMenu}
          style={{ position: "fixed", inset: 0, background: "rgba(33,58,45,0.45)", backdropFilter: "blur(2px)", zIndex: 200, display: "flex", justifyContent: "flex-start" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(84vw, 340px)", height: "100%", background: "var(--cream, #f7f2e9)",
              boxShadow: "0 0 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column",
              borderInlineStart: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--line)", background: "var(--green)" }}>
              <span style={{ fontWeight: 700, fontSize: 19, color: "#fff" }}>המחלקות שלנו</span>
              <button
                onClick={closeMenu}
                aria-label="סגירה"
                style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {categories.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 15, padding: "16px 12px" }}>אין מחלקות להצגה.</p>
              ) : (
                categories.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/?cat=${c.id}`}
                    onClick={closeMenu}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "15px 14px", borderRadius: 12, fontSize: 16.5, fontWeight: 600,
                      color: "var(--ink)", marginBottom: 2,
                      borderBottom: i < categories.length - 1 ? "1px solid rgba(207,155,111,0.22)" : "none",
                    }}
                  >
                    <span>{c.name}</span>
                    <span style={{ color: "var(--clay, #cf9b6f)", fontSize: 18, fontWeight: 700 }}>‹</span>
                  </Link>
                ))
              )}
            </div>

            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/" onClick={closeMenu} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: !isGarden ? "var(--green)" : "var(--card)", color: !isGarden ? "#fff" : "var(--ink)", border: "1px solid var(--green)" }}>
                משתלת העיר
              </Link>
              <Link href="/garden" onClick={closeMenu} style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: isGarden ? "var(--green)" : "var(--card)", color: isGarden ? "#fff" : "var(--ink)", border: "1px solid var(--green)" }}>
                גינון העיר
              </Link>
            </div>
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
        fontSize: 14,
        fontWeight: 600,
        padding: "8px 14px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        background: active ? "var(--green)" : "transparent",
        color: active ? "#fff" : "var(--ink)",
        border: active ? "1px solid var(--green)" : "1px solid var(--line)",
      }}
    >
      {label}
    </Link>
  );
}

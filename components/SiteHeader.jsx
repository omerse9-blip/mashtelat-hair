"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";

const BTN_BG = "#efe7d8";
const BTN_BORDER = "#e0d4bf";
const BTN_SHADOW = "0 1px 3px rgba(91,70,40,0.10)";

export default function SiteHeader({ searchIndex, nurseryCategories = [], gardenCategories = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const isGarden = pathname.startsWith("/garden");
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const categories = isGarden ? gardenCategories : nurseryCategories;
  const menuTitle = isGarden ? "שירותי הגינון" : "המחלקות שלנו";
  const baseHref = isGarden ? "/garden" : "/";

  useEffect(() => { setMounted(true); }, []);

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

  function goToCategory(catId) {
    const url = `${baseHref}?cat=${catId}`;
    closeMenu();
    setTimeout(() => {
      router.push(url);
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function goHome() {
    closeMenu();
    setTimeout(() => {
      router.push(baseHref);
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  const menuOverlay = (
    <div
      onClick={closeMenu}
      style={{ position: "fixed", inset: 0, background: "rgba(33,58,45,0.45)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", justifyContent: "flex-start" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(84vw, 340px)", height: "100%", background: "#f7f2e9",
          boxShadow: "0 0 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "var(--green)", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 19, color: "#fff" }}>{menuTitle}</span>
          <button
            onClick={closeMenu}
            aria-label="סגירה"
            style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <button
            onClick={goHome}
            style={{
              width: "100%", textAlign: "inherit", cursor: "pointer", background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10, fontSize: 16.5, fontWeight: 700,
              color: "var(--green)", fontFamily: "inherit",
              border: "none", borderBottom: "1px solid rgba(207,155,111,0.22)",
            }}
          >
            <span>דף הבית</span>
            <span style={{ color: "#cf9b6f", fontSize: 18, fontWeight: 700 }}>‹</span>
          </button>
          {categories.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 15, padding: "16px 12px" }}>אין מחלקות להצגה.</p>
          ) : (
            categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goToCategory(c.id)}
                style={{
                  width: "100%", textAlign: "inherit", cursor: "pointer", background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10, fontSize: 16.5, fontWeight: 600,
                  color: "var(--ink)", fontFamily: "inherit",
                  border: "none",
                  borderBottom: i < categories.length - 1 ? "1px solid rgba(207,155,111,0.22)" : "none",
                }}
              >
                <span>{c.name}</span>
                <span style={{ color: "#cf9b6f", fontSize: 18, fontWeight: 700 }}>‹</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(247,242,233,0.92)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="תפריט"
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, width: 42, height: 42, borderRadius: 12, border: `1px solid ${BTN_BORDER}`, background: BTN_BG, boxShadow: BTN_SHADOW, cursor: "pointer", padding: 0 }}
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
          <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 999, border: `1px solid ${BTN_BORDER}`, background: BTN_BG, boxShadow: BTN_SHADOW, fontSize: 20 }} aria-label="עגלה">
            🛒
            {count > 0 ? (
              <span style={{ position: "absolute", top: -4, insetInlineEnd: -4, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: "var(--green)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {menuOpen && mounted ? createPortal(menuOverlay, document.body) : null}
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
        background: active ? "var(--green)" : BTN_BG,
        color: active ? "#fff" : "var(--green)",
        border: active ? "1px solid var(--green)" : `1px solid ${BTN_BORDER}`,
        boxShadow: active ? "none" : BTN_SHADOW,
      }}
    >
      {label}
    </Link>
  );
}

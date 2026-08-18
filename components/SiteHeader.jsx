"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";

const BTN_BG = "#fbf8f1";
const BTN_BORDER = "#ece3d4";
const BTN_SHADOW = "0 1px 2px rgba(91,70,40,0.06)";
const WHATSAPP_GREEN = "#25D366";
const BUSINESS_WA = "972533669089";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M1 1h3l2.4 13.2a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L21.6 6H5.2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={WHATSAPP_GREEN}>
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.13c-1.62 0-3.13-.45-4.43-1.24l-.32-.19-3.01.79.8-2.93-.2-.3A8.11 8.11 0 0 1 3.9 12c0-4.48 3.65-8.13 8.12-8.13 4.47 0 8.12 3.65 8.12 8.13 0 4.48-3.65 8.13-8.12 8.13Zm4.47-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

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
    const targetId = "cat-" + catId;
    const onBasePage = pathname === baseHref;
    closeMenu();
    if (onBasePage) {
      setTimeout(function () {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 320);
    } else {
      router.push(baseHref);
      setTimeout(function () {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 450);
    }
  }

  function goHome() {
    const onBasePage = pathname === baseHref;
    closeMenu();
    if (onBasePage) {
      setTimeout(function () { window.scrollTo({ top: 0, behavior: "smooth" }); }, 320);
    } else {
      router.push(baseHref);
    }
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
            <span style={{ color: "#cf9b6f", fontSize: 18, fontWeight: 700 }}>›</span>
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
                <span style={{ color: "#cf9b6f", fontSize: 18, fontWeight: 700 }}>›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(247,242,233,0.92)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="תפריט"
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, width: 42, height: 42, borderRadius: 12, border: "1px solid " + BTN_BORDER, background: BTN_BG, boxShadow: BTN_SHADOW, cursor: "pointer", padding: 0 }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "var(--ink)", margin: "0 auto", borderRadius: 2 }} />
          </button>
          <SearchOverlay index={searchIndex} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <NavTab href="/" label="משתלת העיר" active={!isGarden} />
          <NavTab href="/garden" label="גינון העיר" active={isGarden} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, flex: 1, minWidth: 0 }}>
          
            href={"https://wa.me/" + BUSINESS_WA}
            target="_blank"
            rel="noreferrer"
            aria-label="וואטסאפ"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 999, border: "1.5px solid " + WHATSAPP_GREEN, background: "#fff", boxShadow: BTN_SHADOW }}
          >
            <WhatsAppIcon />
          </a>
          <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 999, border: "1px solid " + BTN_BORDER, background: BTN_BG, boxShadow: BTN_SHADOW }} aria-label="עגלה">
            <CartIcon />
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
        fontWeight: 700,
        padding: "8px 14px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        minWidth: 108,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: active ? "var(--green)" : BTN_BG,
        color: active ? "#fff" : "var(--green)",
        border: active ? "1px solid var(--green)" : "1px solid " + BTN_BORDER,
        boxShadow: active ? "none" : BTN_SHADOW,
      }}
    >
      {label}
    </Link>
  );
}

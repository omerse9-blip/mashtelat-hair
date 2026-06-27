"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function SiteHeader() {
  const pathname = usePathname();
  const isGarden = pathname.startsWith("/garden");
  const { count } = useCart();

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>משתלת העיר</span>
          <span style={{ fontSize: 20 }}>🌿</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavTab href="/" label="משתלה" active={!isGarden} />
          <NavTab href="/garden" label="גינון" active={isGarden} />
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

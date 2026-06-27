"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isGarden = pathname.startsWith("/garden");

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>משתלת העיר</span>
          <span style={{ fontSize: 20 }}>🌿</span>
        </Link>

        <nav style={{ display: "flex", gap: 8 }}>
          <NavTab href="/" label="משתלה" active={!isGarden} />
          <NavTab href="/garden" label="גינון" active={isGarden} />
        </nav>
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
        transition: "all .15s",
      }}
    >
      {label}
    </Link>
  );
}

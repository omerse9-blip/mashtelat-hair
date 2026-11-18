import Link from "next/link";
import Image from "next/image";
import { productPath } from "../lib/slug";

export default function ProductCard({ product, highlight }) {
  const img = product._image;
  const price = product._price;
  const multi = product._multi;
  const isSubscription = product._isSubscription;
  const inStock = product.in_stock;
  const availableFrom = product._availableFrom;

  const productHref = productPath(product.id, product.name);

  return (
    <Link
      id={`product-${product.id}`}
      href={productHref}
      className="product-card"
      style={{
        border: highlight ? "2px solid var(--green)" : "1px solid var(--line)",
        borderRadius: 14, overflow: "hidden", background: "var(--card)", display: "flex", flexDirection: "column",
        boxShadow: highlight ? "0 0 0 4px rgba(47,93,66,0.45)" : "none",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div
        style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "var(--green-soft)", overflow: "hidden" }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 28 }}>🪴</div>
        )}
        {!inStock ? (
          <span style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "rgba(31,42,36,0.92)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            אזל מהמלאי
          </span>
        ) : null}
        {isSubscription ? (
          <span style={{ position: "absolute", top: 10, insetInlineEnd: 10, background: "#2f6b43", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            🌸 מנוי
          </span>
        ) : null}
        {availableFrom ? (
          <span className="card-available" style={{ position: "absolute", bottom: 10, insetInlineStart: 10, background: "#2f6b43", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 1 }}>
            {availableFrom}
          </span>
        ) : null}
      </div>

      <div className="product-body" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <p className="product-name" style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: "auto" }}>
          {(multi || isSubscription) ? <span style={{ color: "var(--muted)", fontSize: 13 }}>החל מ־</span> : null}
          <span className="product-price" style={{ fontWeight: 700, fontSize: 18, color: "var(--green)" }}>
            {price != null ? `₪${price}` : "—"}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .product-card .product-body { padding: 9px 10px !important; gap: 3px !important; }
          .product-card .product-name { font-size: 17px !important; }
          .product-card .product-price { font-size: 16px !important; }
          .product-card .card-available { font-size: 11px !important; padding: 3px 8px !important; bottom: 8px !important; }
        }
      `}</style>
    </Link>
  );
}

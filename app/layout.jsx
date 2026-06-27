import "./globals.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { CartProvider } from "../components/CartProvider";

export const metadata = {
  title: "משתלת העיר",
  description: "משתלה איכותית באילת — עצים, שיחים, צמחי נוי, כדים וכלי גינון.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <SiteHeader />
          <div style={{ minHeight: "60vh" }}>{children}</div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}

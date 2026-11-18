import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { CartProvider } from "../components/CartProvider";
import { DeliveryProvider } from "../components/DeliveryProvider";
import SiteStatusGate from "../components/SiteStatusGate";
import SessionTracker from "../components/SessionTracker";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import { A11Y_INIT_SCRIPT } from "../lib/a11yInit";
import { getCategories, getProducts, cardImage } from "../lib/siteData";
export const metadata = {
  metadataBase: new URL("https://mashtelathair.co.il"),
  title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
  description: "משתלה באילת: זרי פרחים, צמחי בית, כדים, בלונים ויין למתנה. משלוח באילת ואיסוף עצמי מיוזמה 6, אזור התעשייה. הזמנה אונליין.",
  icons: {
    icon: "/logo-mashtela.png",
    shortcut: "/logo-mashtela.png",
    apple: "/logo-mashtela.png",
  },
  openGraph: {
    title: "משתלה באילת - זרי פרחים, עציצים וצמחי נוי | משתלת העיר",
    description: "משתלה באילת: זרי פרחים, צמחי בית, כדים, בלונים ויין למתנה. משלוח באילת ואיסוף עצמי מיוזמה 6, אזור התעשייה. הזמנה אונליין.",
    url: "https://mashtelathair.co.il",
    siteName: "משתלת העיר",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://mashtelathair.co.il/mashtela-og.png",
        alt: "משתלת העיר",
      },
    ],
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "GardenStore",
  name: "משתלת העיר",
  image: "https://mashtelathair.co.il/mashtela-og.png",
  telephone: "+972533669089",
  address: {
    "@type": "PostalAddress",
    streetAddress: "יוזמה 6, אזור התעשייה",
    addressLocality: "אילת",
    addressCountry: "IL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "09:00",
      closes: "15:00",
    },
  ],
  url: "https://mashtelathair.co.il",
  "@id": "https://mashtelathair.co.il/#business",
  description: "משתלה באילת: זרי פרחים, צמחי בית, כדים, בלונים ויין למתנה. משלוח באילת ואיסוף עצמי מהמשתלה, הזמנה אונליין.",
  areaServed: { "@type": "City", name: "אילת" },
  hasMap: "https://www.google.com/maps/place/?q=place_id:ChIJAYo6AjhxABURzvN46FMox1A",
  sameAs: [
    "https://www.instagram.com/mishtelet_city",
    "https://www.facebook.com/share/1BCkoPJAca/",
  ],
  potentialAction: { "@type": "OrderAction", target: "https://mashtelathair.co.il/" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "משתלת העיר",
  url: "https://mashtelathair.co.il",
  inLanguage: "he-IL",
  publisher: { "@id": "https://mashtelathair.co.il/#business" },
};
async function nurseryCategoriesWithImages(nurseryCats) {
  const withProducts = new Set();
  try {
    for (const c of nurseryCats) {
      const products = await getProducts(c.id);
      if (products.some((p) => cardImage(p))) withProducts.add(String(c.id));
    }
  } catch (e) { /* התעלמות */ }
  return withProducts;
}
export default async function RootLayout({ children }) {
  let nurseryCategories = [];
  let gardenCategories = [];
  try {
    nurseryCategories = await getCategories("nursery");
  } catch (e) { /* התעלמות */ }
  try {
    gardenCategories = await getCategories("garden");
  } catch (e) { /* התעלמות */ }
  const nurseryCatIdsWithProducts = await nurseryCategoriesWithImages(nurseryCategories);
  const visibleNurseryCategories = nurseryCategories.filter((c) => nurseryCatIdsWithProducts.has(String(c.id)));
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">דילוג לתוכן הראשי</a>
        <SiteStatusGate>
          <CartProvider>
            <DeliveryProvider>
              <SiteHeader nurseryCategories={visibleNurseryCategories} gardenCategories={gardenCategories} />
              <div id="site-zoom">
                <div id="main-content" tabIndex={-1} style={{ minHeight: "60vh" }}>{children}</div>
                <SiteFooter categories={visibleNurseryCategories.filter((c) => !c.is_featured)} />
              </div>
            </DeliveryProvider>
          </CartProvider>
        </SiteStatusGate>
        <AccessibilityToolbar />
        <SessionTracker />
        <Analytics />
      </body>
    </html>
  );
}

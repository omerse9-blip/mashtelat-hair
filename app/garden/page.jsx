import { Suspense } from "react";
import Image from "next/image";
import { getCategories, getGardenWorks } from "../../lib/siteData";
import GardenGallery from "../../components/GardenGallery";
export const revalidate = 0;
export const metadata = {
  title: "גינון העיר — הקמת גינות, תחזוקה ושדרוג באילת",
  description: "גינון העיר: הקמת גינות, תחזוקה שוטפת ושדרוג גינה באילת. צפו בעבודות שלנו ותאמו פגישה.",
};
export default async function GardenPage() {
  let categories = [];
  const worksByCat = {};
  try {
    categories = await getCategories("garden");
    for (const c of categories) {
      worksByCat[c.id] = await getGardenWorks(c.id);
    }
  } catch (e) {
    categories = [];
  }
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 56px" }}>
      <section style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
          <Image
            src="/logo-ginun.png"
            alt="גינון העיר"
            width={108}
            height={108}
            priority
            style={{ width: 108, height: 108, objectFit: "contain" }}
          />
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.12, marginBottom: 14 }}>
          גינה שמדברת בעדכם.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
          הקמת גינות, תחזוקה שוטפת ושדרוג — עבודה מקצועית מהיסוד ועד הפרט האחרון.
        </p>
      </section>
      <Suspense fallback={null}>
        <GardenGallery categories={categories} worksByCat={worksByCat} />
      </Suspense>
    </main>
  );
}

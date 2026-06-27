import { Suspense } from "react";
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
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px" }}>
      <section style={{ textAlign: "center", marginBottom: 44 }}>
        <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>גינון העיר</p>
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

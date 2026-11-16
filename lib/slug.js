// כתובת מוצר: המזהה הוא המפתח, השם רק מלווה אותו (כמו באמזון) - שינוי שם לא שובר קישורים
export function slugify(name) {
  return String(name || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/["'`״׳]/g, "")
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function productPath(id, name) {
  const s = slugify(name);
  return s ? `/product/${id}/${encodeURIComponent(s)}` : `/product/${id}`;
}

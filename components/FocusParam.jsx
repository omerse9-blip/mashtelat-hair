"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// קורא את פרמטר ה-focus מהכתובת בתוך רכיב קטן ונפרד,
// כדי שהקטלוג עצמו ייווצר בשרת ויגיע לגוגל כ-HTML מלא
export default function FocusParam({ onChange }) {
  const searchParams = useSearchParams();
  const f = searchParams.get("focus");
  useEffect(() => {
    onChange(f || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f]);
  return null;
}

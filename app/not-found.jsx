import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>הדף לא נמצא.</h1>
      <Link href="/" style={{ color: "var(--green)", fontWeight: 600 }}>חזרה למשתלה</Link>
    </main>
  );
}

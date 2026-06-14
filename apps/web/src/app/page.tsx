import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#fafafa",
        color: "#18181b",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>CFO-AIOS</h1>
      <p style={{ marginTop: 8, color: "#52525b" }}>
        AI CFO 비서 — 포트 <strong>5555</strong>에서 실행됩니다.
      </p>
      <p style={{ marginTop: 16 }}>
        <Link href="/dashboard" style={{ color: "#2563eb", fontWeight: 500 }}>
          대시보드로 이동 →
        </Link>
      </p>
      <p style={{ marginTop: 24, fontSize: 14, color: "#71717a" }}>
        화면이 비어 있으면 <code>http://localhost:5555</code> 인지 확인하고,{" "}
        <code>pnpm dev</code>로 API(4000)와 Web(5555)을 함께 실행하세요.
      </p>
    </div>
  );
}

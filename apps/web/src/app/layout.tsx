import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CFO-AIOS",
  description: "1인기업 대표를 위한 AI CFO 비서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ backgroundColor: "#fafafa", color: "#18181b" }}>
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: "#fafafa", color: "#18181b", margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}

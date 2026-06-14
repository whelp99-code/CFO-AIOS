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
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

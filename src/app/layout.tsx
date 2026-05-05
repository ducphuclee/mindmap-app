import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindMap App",
  description: "AI-powered mind mapping application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

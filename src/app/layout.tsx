import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="dark bg-black text-[#f0f0f0] font-body antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

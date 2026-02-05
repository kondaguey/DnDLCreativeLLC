import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"; // Import the wrapper we just made
import "./globals.css";

// 1. Setup Nunito Sans with all necessary weights
const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600", "700", "800", "900"],
  display: "swap",
});

// 2. Update Metadata to your new Brand Identity
export const metadata: Metadata = {
  title: {
    template: "%s | DnDL Creative LLC",
    default: "DnDL Creative LLC | Innovative Production & Creative Solutions",
  },
  description:
    "DnDL Creative LLC is a multi-disciplinary creative production house and parent company to Cinesonic, DineOut Digital, and the audiobook works of Daniel (not Day) Lewis.",
  openGraph: {
    title: "DnDL Creative LLC",
    description: "Innovative Production & Creative Solutions",
    type: "website",
    locale: "en_US",
    url: "https://dndlcreative.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Added scroll-behavior and hydration warning suppression
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to Supabase for faster DB connections */}
        <link
          rel="preconnect"
          href="https://gpjgvdpicjqrerqqzhyx.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://gpjgvdpicjqrerqqzhyx.supabase.co"
        />
      </head>
      <body
        suppressHydrationWarning={true}
        // Combined Nunito Variable + Your Custom Background Gradients + Selection Colors
        className={`${nunito.variable} antialiased bg-[#fafaf9] md:bg-[linear-gradient(to_bottom_right,#fafaf9,#f0f9f9,#eef2ff)] text-slate-800 selection:bg-teal-200`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

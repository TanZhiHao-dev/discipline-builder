import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The template's display face — Stack Sans Headline (variable, 400–700)
const stackSans = localFont({
  src: "../../public/fonts/stack-sans-headline-var.woff2",
  variable: "--font-headline",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Discipline Builder — Build habits that actually stick",
  description:
    "A calmer way to build habits. Simple routines, flexible streaks, and gentle progress that fits into real life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${stackSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

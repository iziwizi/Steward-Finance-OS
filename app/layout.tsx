import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
import { InstallPrompt } from "./install-prompt";
import { CookieSanitizer } from "@/components/cookie-sanitizer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "StewardOS — Personal Finance Operating System",
  description: "Faithful, wise, and prosperous personal finance operating system.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/brand/icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/brand/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StewardOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1D6458",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <CookieSanitizer />
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}

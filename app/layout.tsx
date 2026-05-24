import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFlow — Personal Finance",
  description: "Track your money with clarity",
  // PWA manifest
  manifest: "/manifest.json",
  // iOS standalone mode (hides Safari address bar & navigation)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinFlow",
  },
  // Fallback for older Android / other browsers
  applicationName: "FinFlow",
  formatDetection: { telephone: false },
};

// Proper mobile viewport — enables safe-area-inset-* on iOS notched devices
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // Colours the browser chrome / status bar on Android Chrome
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ReduxProvider>
          <AppShell>{children}</AppShell>
        </ReduxProvider>
      </body>
    </html>
  );
}

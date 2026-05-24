import type { Metadata, Viewport } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FinFlow — Personal Finance",
  description: "Track your money with clarity",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinFlow",
  },
  applicationName: "FinFlow",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ReduxProvider>
          <AppShell>{children}</AppShell>
        </ReduxProvider>
      </body>
    </html>
  );
}

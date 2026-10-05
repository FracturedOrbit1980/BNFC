import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { RoleProvider } from "@/components/auth/role-session";
import { ClubProvider } from "@/components/club/club-provider";
import { ClubTheme } from "@/components/club/club-theme";
import { appearanceScript } from "@/components/layout/appearance";
import { AppShell } from "@/components/layout/app-shell";
import { CLUB_NAME } from "@/lib/club/catalog";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: CLUB_NAME,
    template: `%s · Sportfica`,
  },
  description: "Club platform for Sportfica. Squads, drills, and pitch-side match tools.",
  applicationName: CLUB_NAME,
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "Sportfica",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#d16b6f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="bnfc-appearance" strategy="beforeInteractive">
          {appearanceScript}
        </Script>
        <RoleProvider>
          <ClubTheme />
          <AppShell>
            <ClubProvider>{children}</ClubProvider>
          </AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}

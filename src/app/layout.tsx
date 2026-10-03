import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ClubProvider } from "@/components/club/club-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getClubRole } from "@/lib/auth/club-role";
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
    template: `%s · BNFC`,
  },
  description: "Club platform for Benoni Northerns FC. Squads, drills, and pitch-side match tools.",
  applicationName: CLUB_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BNFC",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const role = await getClubRole();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell role={role}>
          <ClubProvider>{children}</ClubProvider>
        </AppShell>
      </body>
    </html>
  );
}

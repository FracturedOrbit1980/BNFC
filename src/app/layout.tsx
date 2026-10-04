import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { RoleProvider } from "@/components/auth/role-session";
import { ClubProvider } from "@/components/club/club-provider";
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
    template: `%s · BNFC`,
  },
  description: "Club platform for Benoni Northerns FC. Squads, drills, and pitch-side match tools.",
  applicationName: CLUB_NAME,
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "BNFC",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <RoleProvider>
          <AppShell>
            <ClubProvider>{children}</ClubProvider>
          </AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}

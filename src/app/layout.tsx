import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jadual Ustaz Alif",
  description: "Aplikasi jadual waktu mengajar peribadi Ustaz Alif, SK Subang Jaya. Jadual Oktober 2026.",
  icons: { icon: "/jadual-ustaz-alif/illustrations/book-sparkle.svg", apple: "/jadual-ustaz-alif/icons/apple-touch-icon.png" },
  manifest: "/jadual-ustaz-alif/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Ustaz Alif", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E9E2FF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ms"><body>{children}</body></html>;
}

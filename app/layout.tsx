import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nContext";

export const metadata: Metadata = {
  title: "Saudi Hospital OS | نظام إدارة المستشفى",
  description: "نظام إدارة مستشفى سعودي شامل — مواعيد، سجلات طبية، وصفات، فوترة، تأمين، أسرّة، صيدلية.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hospital OS",
  },
  openGraph: {
    title: "Saudi Hospital OS",
    description: "Comprehensive Hospital Management System",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0e1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-cairo antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

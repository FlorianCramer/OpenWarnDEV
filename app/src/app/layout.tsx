import type { Metadata } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://openwarnde.web.app"),

  title: {
    default: "OpenWarnDE",
    template: "%s | OpenWarnDE",
  },

  description:
    "OpenWarnDE ist eine sich in Entwicklung befindende Plattform für öffentliche Warnmeldungen, Gefahreninformationen und Lageinformationen in Deutschland.",

  applicationName: "OpenWarnDE",

  keywords: [
    "OpenWarnDE",
    "Warnmeldungen",
    "Warnungen",
    "Deutschland",
    "Katastrophenschutz",
    "Bevölkerungsschutz",
    "Gefahreninformationen",
    "Unwetterwarnungen",
    "Live-Warnungen",
    "Feuerwehr",
  ],

  authors: [
    {
      name: "OpenWarnDE",
      url: "https://openwarnde.web.app/",
    },
  ],

  creator: "OpenWarnDE",
  publisher: "OpenWarnDE",

  alternates: {
    canonical: "https://openwarnde.web.app/",
  },

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],

    shortcut: "/icon.png",

    apple: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "de_DE",

    url: "https://openwarnde.web.app/",
    siteName: "OpenWarnDE",

    title: "OpenWarnDE",

    description:
      "OpenWarnDE ist eine sich in Entwicklung befindende Plattform für öffentliche Warnmeldungen, Gefahreninformationen und Lageinformationen in Deutschland.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenWarnDE - Warninformationen für Deutschland",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "OpenWarnDE",

    description:
      "Öffentliche Warnmeldungen und Gefahreninformationen für Deutschland. OpenWarnDE befindet sich aktuell in Entwicklung.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    telephone: false,
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="h-full w-full">
      <head>
        <ThemeModeScript />
      </head>
      <body className="h-full w-full flex flex-col antialiased bg-gray-100 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
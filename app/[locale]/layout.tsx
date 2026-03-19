import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from "@/shared/lib/seo";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/shared/constants/site";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { TooltipProvider } from "@/shared/ui/TooltipProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: SITE_NAME,
    authors: [{ name: "Promitly Contributors" }],
    category: "developer tools",
    creator: "Promitly Contributors",
    publisher: SITE_NAME,
    description: SITE_DESCRIPTION,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
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
    ...buildPageMetadata({
      title: "Open-source prompt evaluation platform",
      description: SITE_DESCRIPTION,
      path: "",
      locale,
    }),
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <TooltipProvider />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

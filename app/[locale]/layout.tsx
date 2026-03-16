import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Promitly | Professional Prompt Evaluation Dashboard",
  description: "Evaluate, refine, and optimize AWS Bedrock prompts with real-time vector similarity, semantic grading, and high-end responsive design.",
  keywords: ["AI", "LLM", "Prompt Engineering", "Evaluation", "AWS Bedrock", "Vector Similarity", "Semantic Analysis"],
  authors: [{ name: "Promitly Team" }],
  openGraph: {
    title: "Promitly | Prompt Evaluation Redefined",
    description: "The premier testbed for evaluating and optimizing AWS Bedrock prompts.",
    type: "website",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/TooltipProvider";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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

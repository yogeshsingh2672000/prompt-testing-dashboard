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

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

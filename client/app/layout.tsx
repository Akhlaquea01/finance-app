import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "sonner"
import { FinanceProvider } from "./context/finance-context"
import { QueryProvider } from "./providers/QueryProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance App - Smart Money Management",
  description:
    "Take control of your finances with our comprehensive money management app. Track expenses and achieve your financial goals.",
  keywords: [
    "finance",
    "money management",
    "expense tracking",
    "financial planning",
  ],
  authors: [{ name: "Finance App Team" }],
  creator: "Finance App",
  publisher: "Finance App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Finance App - Smart Money Management",
    description:
      "Take control of your finances with our comprehensive money management app.",
    siteName: "Finance App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance App - Smart Money Management",
    description:
      "Take control of your finances with our comprehensive money management app.",
    creator: "@financeapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} text-sm sm:text-base`}>
        <QueryProvider>
          <FinanceProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                  <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
                <SiteFooter className="mt-8" />
              </div>
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </FinanceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


import './globals.css'
import { ToastProvider } from "@/components/ui/toast"

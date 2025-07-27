import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, AuthSidebarProvider } from "@/components/providers";
import { SessionProvider } from "@/components/features/auth";
import { Header, ScalableContent } from "@/components/layout";
import { ThreadsSidebar } from "@/components/features/threads";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import "@/lib/markmap-defaults";
import { QueryProvider } from "@/lib/providers/query-provider";

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
    default: "PromptMap - AI-Powered Mind Mapping Tool",
    template: "%s | PromptMap"
  },
  description: "Transform your ideas into beautifully organized mind maps instantly with PromptMap. AI-powered mind mapping tool for brainstorming, note-taking, and visualizing concepts.",
  keywords: ["mind map", "AI mind map", "brainstorming tool", "visual thinking", "concept mapping", "idea organization", "productivity tool", "thought visualization"],
  authors: [{ name: "PromptMap Team" }],
  creator: "PromptMap",
  publisher: "PromptMap",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://prompt-map.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PromptMap - AI-Powered Mind Mapping Tool",
    description: "Transform your ideas into beautifully organized mind maps instantly with PromptMap. AI-powered mind mapping tool for brainstorming, note-taking, and visualizing concepts.",
    url: "https://prompt-map.vercel.app/",
    siteName: "PromptMap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromptMap - AI-Powered Mind Mapping Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptMap - AI-Powered Mind Mapping Tool",
    description: "Transform your ideas into beautifully organized mind maps instantly with PromptMap",
    images: ["/twitter-image.png"],
    creator: "@promptmap",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        ><Analytics/> 
        <SpeedInsights/>
        <QueryProvider>
          <SessionProvider>
            <AuthSidebarProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <div className="relative flex-1 flex flex-col">
                  <ThreadsSidebar />
                  <ScalableContent>
                    {children}
                  </ScalableContent>
                </div>
              </div>
            </AuthSidebarProvider>
            <Toaster />
          </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/auth/session-provider";
import { Header } from "@/components/ui/header";
import { ThreadsSidebar } from "@/components/ui/threads-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ScalableContent } from "@/components/ui/scalable-content";
import { AuthSidebarProvider } from "@/components/auth-sidebar-provider";
import "./globals.css";
import "@/lib/markmap-defaults";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptMap",
  description: "Generated Mind Map from prompts",
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
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}

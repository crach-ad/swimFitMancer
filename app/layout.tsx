import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@/styles/animations.css"
import { ThemeProvider } from "@/components/theme-provider"
// NavBar removed per request
import Providers from "./providers"
import { Toaster } from "sonner"
import { AnimationProvider } from "@/components/animation-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwimFit - Client Management",
  description: "Manage your swim clients, track attendance, and schedule sessions",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <AnimationProvider>
              <div className="flex min-h-screen flex-col bg-gradient-to-b from-cyan-50 to-blue-100">
                <main className="flex-1">
                  {children}
                </main>
                <Toaster position="top-right" />
              </div>
            </AnimationProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
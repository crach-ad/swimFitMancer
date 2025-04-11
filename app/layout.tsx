import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NavBar } from "@/components/navbar"
import Providers from "./providers"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwimFit - Client Management",
  description: "Manage your swim clients, track attendance, and schedule sessions",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
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
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-cyan-50 to-blue-100">
              <NavBar />
              <main className="flex-1">
                {children}
              </main>
              <Toaster position="top-right" />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
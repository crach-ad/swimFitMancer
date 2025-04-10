"use client"

import { useState, useEffect, ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering once mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render children after mounting to avoid hydration errors
  if (!mounted) {
    return null
  }

  return <>{children}</>
}

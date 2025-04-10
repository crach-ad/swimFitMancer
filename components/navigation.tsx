"use client"

import Link from "next/link"
import { Calendar, Users, ClipboardCheck } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? "text-cyan-700" : "text-cyan-500"
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-cyan-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-around">
        <Link href="/attendance" className={`flex flex-1 flex-col items-center py-3 ${isActive("/attendance")}`}>
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-xs">Attendance</span>
        </Link>
        <Link href="/clients" className={`flex flex-1 flex-col items-center py-3 ${isActive("/clients")}`}>
          <Users className="h-5 w-5" />
          <span className="text-xs">Clients</span>
        </Link>
        <Link href="/schedule" className={`flex flex-1 flex-col items-center py-3 ${isActive("/schedule")}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Link>
      </div>
    </nav>
  )
}

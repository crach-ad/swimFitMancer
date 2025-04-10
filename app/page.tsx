"use client"
import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  // Redirect to attendance page on load
  useEffect(() => {
    router.push("/attendance")
  }, [router])

  return null
}

function SessionCard({ time, name, attendees, location, active = false }) {
  return (
    <Card className={`overflow-hidden ${active ? "border-cyan-400 bg-cyan-50" : "bg-white/80 backdrop-blur"}`}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex h-full w-2 ${active ? "bg-cyan-400" : "bg-cyan-200"}`}></div>
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-cyan-900">{name}</div>
              <div className="text-sm font-medium text-cyan-600">{time}</div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-xs text-cyan-600">{location}</div>
              <div className="flex items-center text-xs text-cyan-600">
                <Users className="mr-1 h-3 w-3" /> {attendees} attendees
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

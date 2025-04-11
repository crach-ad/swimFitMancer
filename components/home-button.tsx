import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HomeButton() {
  return (
    <div className="mb-4">
      <Link href="/">
        <Button 
          variant="outline" 
          className="flex items-center gap-1 bg-white hover:bg-cyan-50 text-cyan-700 border-cyan-200"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </Link>
    </div>
  )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface AttendeeRowProps {
  name: string
  status: string
  time: string
  image: string
  notes?: string
}

export function AttendeeRow({ name, status, time, image, notes }: AttendeeRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {notes && (
          <div className="text-xs text-gray-500 max-w-[150px] truncate">{notes}</div>
        )}
        <Badge 
          variant={status === "present" ? "default" : status === "late" ? "outline" : "secondary"}
          className={
            status === "present" 
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : status === "late"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                : ""
          }
        >
          {status === "present" ? "Present" : status === "late" ? "Late" : status}
        </Badge>
      </div>
    </div>
  )
}

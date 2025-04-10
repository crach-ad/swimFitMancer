"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Attendance } from "@/lib/attendance-service"

// Define AttendanceWithDetails interface locally
interface AttendanceWithDetails extends Attendance {
  clientName?: string;
  sessionName?: string;
  timestamp?: string; // For the API response
}

export interface SessionHistoryProps {
  id: string
  name: string
  time: string
  attendees: string
  date: string
}

export function SessionHistoryDialog({ session, date }: { session: SessionHistoryProps, date: string }) {
  const [loading, setLoading] = useState<boolean>(false)
  const [attendanceData, setAttendanceData] = useState<AttendanceWithDetails[]>([])
  
  // Fetch attendance data when dialog opens
  const handleDialogOpen = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/attendance/session?sessionId=${session.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data')
      }
      const data = await response.json()
      setAttendanceData(data.attendance)
    } catch (error) {
      console.error('Error fetching session attendance:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog onOpenChange={(isOpen) => {
      if (isOpen) handleDialogOpen()
    }}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-cyan-50 transition-colors">
          <div>
            <div className="font-medium text-cyan-900">{session.name}</div>
            <div className="text-xs text-cyan-600">{session.time}</div>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-cyan-600 mr-2">{session.attendees}</div>
            <Button size="sm" variant="ghost" className="h-6 w-6 rounded-full p-0 text-cyan-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{session.name} - Attendance</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-cyan-800">{date}</div>
            <div className="text-sm text-cyan-800">{session.time}</div>
          </div>
          
          {/* Session Attendance Records */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div>
              </div>
            ) : attendanceData.length > 0 ? (
              attendanceData.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={record.clientName || 'Unknown Client'} />
                      <AvatarFallback>{(record.clientName || 'UC').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{record.clientName || 'Unknown Client'}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.timestamp || record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.notes && (
                      <div className="text-xs text-gray-500 max-w-[150px] truncate">{record.notes}</div>
                    )}
                    <Badge 
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Present
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for this session
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center text-sm text-cyan-600">
            <p>Total Attendees: {attendanceData.length}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

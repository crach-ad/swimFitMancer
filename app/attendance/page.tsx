"use client"

import { useState, useEffect } from "react"
import { QrCodeIcon as QrCodeScan, Plus, Search, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/firebase/auth-context"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { QrScanner } from "@/components/qr-scanner"
// Import type definitions only
import type { Client } from "@/lib/client-service"
import type { Session } from "@/lib/session-service"
import type { Attendance } from "@/lib/attendance-service"
// Import custom components
import { SessionHistoryDialog, type SessionHistoryProps } from "./session-history-dialog"
import { HomeButton } from "@/components/home-button"

interface AttendanceWithDetails extends Attendance {
  clientName?: string;
  sessionName?: string;
}

// Import withAuth HOC for route protection
import withAuth from "@/lib/firebase/with-auth"

function AttendancePage() {
  const [activeTab, setActiveTab] = useState("today")
  const [sessions, setSessions] = useState<Session[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithDetails[]>([])
  const [selectedSession, setSelectedSession] = useState<string>("") 
  const [selectedClient, setSelectedClient] = useState<string>("") 
  const [attendanceStatus, setAttendanceStatus] = useState<string>("present")
  const [attendanceNotes, setAttendanceNotes] = useState<string>("") 
  const [searchQuery, setSearchQuery] = useState<string>("") 
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [scannerOpen, setScannerOpen] = useState<boolean>(false)
  const [selectedOtherSession, setSelectedOtherSession] = useState<string>("") 
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>("") 
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string>("")  
  

  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch sessions
        const sessionsResponse = await fetch('/api/sessions')
        const sessionsData = await sessionsResponse.json()
        
        // Fetch clients
        const clientsResponse = await fetch('/api/clients')
        const clientsData = await clientsResponse.json()
        
        // Fetch attendance records
        const attendanceResponse = await fetch('/api/attendance')
        const attendanceData = await attendanceResponse.json()
        
        setSessions(sessionsData.sessions || [])
        setClients(clientsData.clients || [])
        setAttendanceRecords(attendanceData.records || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Helper function to format time
  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      return isoString
    }
  }
  
  // Helper function to format time range
  const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }
  

  
  // Helper function to check if a session is current (happening now)
  const isCurrentSession = (session: Session): boolean => {
    const now = new Date()
    const startTime = new Date(session.startTime)
    const endTime = new Date(session.endTime)
    
    return now >= startTime && now <= endTime
  }
  
  // Helper function to get session status
  const getSessionStatus = (session: Session): string => {
    const now = new Date()
    const startTime = new Date(session.startTime)
    const endTime = new Date(session.endTime)
    
    if (now < startTime) return "upcoming"
    if (now > endTime) return "completed"
    return "in progress"
  }
  
  // Helper function to get attendance records for a session
  const getSessionAttendance = (sessionId: string): AttendanceWithDetails[] => {
    return attendanceRecords.filter(record => record.sessionId === sessionId)
  }
  
  // Helper function to get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }
  
  // Helper function to check if a client has already checked in to a session
  const hasCheckedIn = (clientId: string, sessionId: string): boolean => {
    return attendanceRecords.some(
      record => record.clientId === clientId && record.sessionId === sessionId
    )
  }
  
  // Handle QR code scanning with clientId from QR code and optional notes
  const handleQRCodeScan = async (clientId: string, sessionId: string, notes?: string) => {
    try {
      console.log('QR code scan with client ID:', clientId);
      
      if (!clientId) {
        throw new Error("Invalid QR code")
      }
      
      // Find client by ID to confirm it exists
      console.log('Looking for client in client list:', clients.length, 'clients');
      const client = clients.find(c => c.id === clientId)
      console.log('Client match result:', client ? `Found: ${client.name}` : 'Not found');
      
      if (!client) {
        throw new Error("Client not found for ID: " + clientId)
      }
      
      // Log current time for session detection
      const now = new Date();
      console.log('Current time for session detection:', now.toISOString());
      
      // Use the sessionId parameter passed from the QR scanner, which contains the selected session
      console.log('Using session ID selected in QR scanner:', sessionId);
      
      // Validate that the selected session exists
      const selectedSessionData = sessions.find(s => s.id === sessionId);
      if (selectedSessionData) {
        console.log('Selected session found:', selectedSessionData.name);
      } else {
        // If the session doesn't exist (perhaps it was deleted), fall back to current session
        console.log('Selected session not found. Checking for current session...');
        const currentSession = sessions.find(s => isCurrentSession(s));
        if (currentSession) {
          sessionId = currentSession.id;
          console.log('Using current session instead:', currentSession.name);
        }
      }
      
      if (!sessionId && sessions.length > 0) {
        console.log('No current or selected session, finding most appropriate session...');
        
        // Sort sessions by start time, most recent first
        const sortedSessions = [...sessions].sort((a, b) => {
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
        
        // Find the most recent session that hasn't ended too long ago (within last 2 hours)
        const recentSession = sortedSessions.find(s => {
          const endTime = new Date(s.endTime);
          const timeDiff = now.getTime() - endTime.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          return hoursDiff <= 2; // Session ended within the last 2 hours
        });
        
        // If found a recent session, use it
        if (recentSession) {
          sessionId = recentSession.id;
          console.log('Using recent session that ended within 2 hours:', recentSession.name);
        } else {
          // Otherwise use the first upcoming session
          const upcomingSession = sessions.find(s => getSessionStatus(s) === "upcoming");
          if (upcomingSession) {
            sessionId = upcomingSession.id;
            console.log('Using upcoming session:', upcomingSession.name);
          } else {
            // Last resort: use the most recent session regardless of how long ago it ended
            sessionId = sortedSessions[0]?.id;
            console.log('Using most recent session as last resort:', 
              sortedSessions[0] ? sortedSessions[0].name : 'No sessions available');
          }
        }
      }
      
      console.log('Final session ID choice for attendance:', sessionId || 'No session ID available');
      
      if (!sessionId) {
        // Instead of throwing an error, let's create an ad-hoc session
        const adhocSessionId = `adhoc_${Date.now()}`;
        const adhocSession = {
          id: adhocSessionId,
          name: "Unscheduled Session",
          startTime: new Date(Date.now() - 30 * 60000).toISOString(), // started 30 min ago
          endTime: new Date(Date.now() + 90 * 60000).toISOString(),  // ends in 90 min
          maxAttendees: 20,
          description: "Ad-hoc session created during attendance check-in",
          location: "Main Facility"
        };
        
        // Set the sessionId to our new ad-hoc session
        sessionId = adhocSessionId;
        
        try {
          // Add this session to the database
          console.log('Creating ad-hoc session:', adhocSession);
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adhocSession)
          });
          
          if (!response.ok) {
            throw new Error("Failed to create ad-hoc session");
          }
          
          const newSession = await response.json();
          console.log('Ad-hoc session created:', newSession);
          
          // Update sessions list
          setSessions(prev => [...prev, adhocSession]);
          
          // Use this new session
          sessionId = adhocSession.id;
        } catch (error) {
          console.error('Failed to create ad-hoc session:', error);
          throw new Error("No active session found and could not create an ad-hoc session. Please create a session first.");
        }
      }
      
      console.log('About to send attendance record to API:', {
        clientId,
        sessionId,
        clientName: client.name,
        sessionName: sessions.find(s => s.id === sessionId)?.name || 'Unknown Session',
        notes,
        status: 'present'
      });
      
      // Record attendance via API with additional debugging
      const response = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          sessionId,
          notes,
          status: 'present', // Default to present for QR code scans
          timestamp: new Date().toISOString() // Explicitly include timestamp for better tracking
        }),
      })
      
      // Detailed logging of the response
      console.log('API response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record attendance")
      }
      
      const result = await response.json()
      
      // Update attendance records
      setAttendanceRecords(prev => [
        ...prev,
        {
          ...result.record,
          clientName: client.name,
          sessionName: sessions.find(s => s.id === sessionId)?.name || 'Unknown Session'
        }
      ])
      
      // Get the session name for better feedback
      const sessionName = sessions.find(s => s.id === sessionId)?.name || 'Unknown Session';
      
      toast({
        title: "Success",
        description: `${client.name} checked into ${sessionName}`,
      })
      
      setScannerOpen(false)
    } catch (error) {
      // More detailed error logging
      console.error("Error processing attendance:", { 
        error, 
        errorType: typeof error, 
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      })
      
      // Determine a user-friendly error message
      let errorMessage = "Failed to record attendance";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Try to extract a message from the error object
        errorMessage = (error as any).message || JSON.stringify(error);
      }
      
      // Show error notification to user
      toast({
        variant: "destructive",
        title: "Error Recording Attendance",
        description: errorMessage,
      })
    }
  }
  
  // Handle manual check-in
  const handleManualCheckIn = async (clientId: string, sessionId: string) => {
    try {
      setIsSubmitting(true)
      
      // Record attendance via API
      const response = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          sessionId,
          notes: attendanceNotes
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record attendance")
      }
      
      const result = await response.json()
      
      // Update attendance records
      setAttendanceRecords(prev => [
        ...prev,
        {
          ...result.record,
          clientName: getClientName(clientId),
          sessionName: sessions.find(s => s.id === sessionId)?.name || 'Unknown Session'
        }
      ])
      
      toast({
        title: "Success",
        description: `Attendance recorded for ${getClientName(clientId)}`,
      })
      
      // Reset the notes field after successful submission
      setAttendanceNotes('')
    } catch (error) {
      console.error("Error recording attendance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record attendance",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-20 p-4">
      {/* Back arrow for navigation to dashboard */}
      <HomeButton />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-cyan-200 bg-white/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-900">Attendance</h1>
          <div className="flex gap-2">

            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-9 w-9 border-cyan-200">
                  <QrCodeScan className="h-5 w-5 text-cyan-700" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Client Check-in</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                  <QrScanner 
                    onScanSuccess={handleQRCodeScan} 
                    clients={clients}
                    currentSessionId={sessions.find(s => isCurrentSession(s))?.id}
                    sessions={sessions}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-9 w-9 border-cyan-200">
                  <Plus className="h-5 w-5 text-cyan-700" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Attendance Manually</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session">Session</Label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger id="session" className="border-cyan-200">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map(session => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name} ({formatTimeRange(session.startTime, session.endTime)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual-client">Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger id="manual-client" className="border-cyan-200">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients
                          .filter(client => client.isActive)
                          .map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                      <SelectTrigger id="status" className="border-cyan-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[80px] rounded-md border border-cyan-200 px-3 py-2 text-sm"
                      placeholder="Add any notes about this attendance record"
                      value={attendanceNotes}
                      onChange={(e) => setAttendanceNotes(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="mt-2 bg-cyan-600 hover:bg-cyan-700" 
                    disabled={isSubmitting || !selectedClient || !selectedSession}
                    onClick={() => handleManualCheckIn(selectedClient, selectedSession)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      'Log Attendance'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-lg border border-cyan-200 bg-white p-1">
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              activeTab === "today" ? "bg-cyan-600 text-white" : "text-cyan-700"
            }`}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              activeTab === "history" ? "bg-cyan-600 text-white" : "text-cyan-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            <p className="mt-4 text-cyan-700">Loading attendance data...</p>
          </div>
        ) : activeTab === "today" ? (
          <>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-8 w-8 text-cyan-600" />
                <p className="mt-4 text-cyan-700">No sessions scheduled for today</p>
                <Button 
                  onClick={() => setActiveTab("history")} 
                  variant="link" 
                  className="mt-2 text-cyan-600"
                >
                  View attendance history
                </Button>
              </div>
            ) : (
              <>
                {/* Current Session */}
                {sessions.filter(session => isCurrentSession(session)).map(session => (
                  <div key={session.id}>
                    <h2 className="mb-3 text-base font-medium text-cyan-900">
                      {session.name} ({formatTimeRange(session.startTime, session.endTime)})
                    </h2>
                    <Card className="mb-6 border-cyan-400 bg-cyan-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-cyan-600">
                            {getSessionAttendance(session.id).length}/{session.maxAttendees} Attendees
                          </div>
                          <Badge className="bg-cyan-200 text-cyan-800">{getSessionStatus(session)}</Badge>
                        </div>

                        {getSessionAttendance(session.id).length > 0 ? (
                          <div className="mt-4 space-y-3">
                            {getSessionAttendance(session.id).map(record => (
                              <AttendeeRow
                                key={record.id}
                                name={getClientName(record.clientId)}
                                status="present"
                                time={formatTime(record.checkInTime)}
                                image="/placeholder.svg?height=32&width=32"
                                notes={record.notes}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-center text-cyan-600">No attendees checked in yet</p>
                        )}

                        {/* Search clients section removed */}

                        <div className="mt-4 space-y-2">
                          {clients
                            .filter(client => 
                              client.isActive && 
                              client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                              !hasCheckedIn(client.id, session.id)
                            )
                            .map(client => (
                              <ClientCheckItem 
                                key={client.id}
                                name={client.name} 
                                image="/placeholder.svg?height=32&width=32" 
                                onCheck={() => handleManualCheckIn(client.id, session.id)}
                              />
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {/* Other Sessions Today */}
                <h2 className="mb-3 text-base font-medium text-cyan-900">Other Sessions Today</h2>
                
                {/* Session selector */}
                <div className="mb-4">
                  <Select 
                    value={selectedOtherSession} 
                    onValueChange={setSelectedOtherSession}
                  >
                    <SelectTrigger className="border-cyan-200 bg-white">
                      <SelectValue placeholder="Select a session to view attendance" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions
                        .filter(session => !isCurrentSession(session))
                        .map(session => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name} ({formatTimeRange(session.startTime, session.endTime)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Client attendance for selected session */}
                {selectedOtherSession && (
                  <Card className="mb-4 border-cyan-200">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-cyan-800">
                          {sessions.find(s => s.id === selectedOtherSession)?.name} Attendance
                        </h3>
                        <Badge className="bg-cyan-100 text-cyan-700">
                          {getSessionAttendance(selectedOtherSession).length}/
                          {sessions.find(s => s.id === selectedOtherSession)?.maxAttendees || 0} Clients
                        </Badge>
                      </div>
                      
                      {getSessionAttendance(selectedOtherSession).length > 0 ? (
                        <div className="space-y-3">
                          {getSessionAttendance(selectedOtherSession).map(record => (
                            <AttendeeRow
                              key={record.id}
                              name={record.clientName || getClientName(record.clientId)}
                              status="present"
                              time={formatTime(record.checkInTime)}
                              image="/placeholder.svg?height=32&width=32"
                              notes={record.notes}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-sm text-cyan-600">
                          No clients checked in to this session yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Session cards summary */}
                <div className="space-y-3">
                  {sessions
                    .filter(session => !isCurrentSession(session))
                    .map(session => (
                      <SessionCard 
                        key={session.id}
                        name={session.name} 
                        time={formatTimeRange(session.startTime, session.endTime)} 
                        status={getSessionStatus(session)} 
                        attendees={`${getSessionAttendance(session.id).length}/${session.maxAttendees}`} 
                      />
                    ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Attendance History */}
            <div className="mb-4 flex items-center">
              <Input
                placeholder="Search by date or session..."
                className="border-cyan-200 bg-white text-cyan-900 placeholder:text-cyan-400"
              />
              <Button size="icon" variant="ghost" className="ml-2 h-10 w-10 shrink-0 text-cyan-700">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <HistoryCard
                date="Yesterday"
                sessions={[
                  { id: "yday-1", name: "Morning Lap Swim", time: "07:00 - 08:00", attendees: "7/8", date: "Yesterday" },
                  { id: "yday-2", name: "Beginner Technique", time: "09:30 - 10:30", attendees: "9/10", date: "Yesterday" },
                  { id: "yday-3", name: "Advanced Training", time: "16:00 - 17:30", attendees: "8/10", date: "Yesterday" },
                ]}
              />
              <HistoryCard
                date="Monday, Apr 8"
                sessions={[
                  { id: "mon-1", name: "Morning Lap Swim", time: "07:00 - 08:00", attendees: "6/8", date: "Monday, Apr 8" },
                  { id: "mon-2", name: "Beginner Technique", time: "09:30 - 10:30", attendees: "8/10", date: "Monday, Apr 8" },
                  { id: "mon-3", name: "Advanced Training", time: "16:00 - 17:30", attendees: "10/10", date: "Monday, Apr 8" },
                ]}
              />
              <HistoryCard
                date="Friday, Apr 5"
                sessions={[
                  { id: "fri-1", name: "Morning Lap Swim", time: "07:00 - 08:00", attendees: "8/8", date: "Friday, Apr 5" },
                  { id: "fri-2", name: "Beginner Technique", time: "09:30 - 10:30", attendees: "7/10", date: "Friday, Apr 5" },
                  { id: "fri-3", name: "Advanced Training", time: "16:00 - 17:30", attendees: "9/10", date: "Friday, Apr 5" },
                ]}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

interface AttendeeRowProps {
  name: string;
  status: string;
  time: string;
  image: string;
  notes?: string;
}

function AttendeeRow({ name, status, time, image, notes }: AttendeeRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-emerald-100 text-emerald-700">Present</Badge>
      case "absent":
        return <Badge className="bg-rose-100 text-rose-700">Absent</Badge>
      case "late":
        return <Badge className="bg-amber-100 text-amber-700">Late</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 border border-cyan-200">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="ml-2">
          <div className="text-sm font-medium text-cyan-900">{name}</div>
          {time && <div className="text-xs text-cyan-600">{time}</div>}
          {notes && notes.trim().length > 0 && (
            <div className="text-xs italic text-cyan-500 mt-1">{notes}</div>
          )}
        </div>
      </div>
      {getStatusBadge(status)}
    </div>
  )
}

interface ClientCheckItemProps {
  name: string;
  image: string;
  onCheck: () => void;
}

function ClientCheckItem({ name, image, onCheck }: ClientCheckItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-cyan-200 bg-white p-2">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 border border-cyan-200">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs">
            {name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="ml-2 text-sm font-medium text-cyan-900">{name}</div>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 rounded-full p-0 text-cyan-700"
        onClick={onCheck}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface SessionCardProps {
  name: string;
  time: string;
  status: string;
  attendees: string;
}

function SessionCard({ name, time, status, attendees }: SessionCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
      case "upcoming":
        return (
          <Badge variant="outline" className="border-cyan-200 text-cyan-600">
            Upcoming
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex h-full w-2 ${status === "completed" ? "bg-emerald-400" : "bg-cyan-200"}`}></div>
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-cyan-900">{name}</div>
              <div className="text-sm font-medium text-cyan-600">{time}</div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-xs text-cyan-600">{attendees} attendees</div>
              {getStatusBadge(status)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface HistoryCardProps {
  date: string;
  sessions: SessionHistoryProps[];
}

function HistoryCard({ date, sessions }: HistoryCardProps) {
  // Nothing needed here, we'll use Dialog state within each session card
  
  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur">
      <CardContent className="p-0">
        <div className="border-b border-cyan-100 bg-cyan-50 px-3 py-2">
          <div className="font-medium text-cyan-800">{date}</div>
        </div>
        <div className="divide-y divide-cyan-100">
          {sessions.map((session: SessionHistoryProps, index: number) => (
            <div key={index} className="relative">
              <SessionHistoryDialog 
                session={{
                  ...session, 
                  date: date
                }} 
                date={date} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Apply authentication protection to the attendance page
export default withAuth(AttendancePage);

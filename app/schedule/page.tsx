"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import type { Session } from "@/lib/session-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { addSession, getSessions } from "@/lib/session-service"
import withAuth from "@/lib/firebase/with-auth"
import { HomeButton } from "@/components/home-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ScheduleSession {
  id: string;
  name: string;
  time: string;
  location: string;
  days: number[];
}

// Interface for SessionCard component props
interface SessionCardProps {
  id: string;
  name: string;
  time: string;
  location: string;
  isToday: boolean;
  status?: 'upcoming' | 'in progress' | 'completed';
}

// Determine session status based on current time and session time
function getSessionStatus(timeString: string): 'upcoming' | 'in progress' | 'completed' {
  const now = new Date();
  const times = timeString.split(' - ');
  if (times.length !== 2) return 'upcoming';
  
  // Parse the time strings (format is HH:MM)
  const [startHour, startMinute] = times[0].split(':').map(Number);
  const [endHour, endMinute] = times[1].split(':').map(Number);
  
  // Create Date objects for session start and end times on today's date
  const sessionDate = new Date(); // Use today for time comparison
  const startTime = new Date(sessionDate);
  startTime.setHours(startHour, startMinute, 0);
  
  const endTime = new Date(sessionDate);
  endTime.setHours(endHour, endMinute, 0);
  
  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'completed';
  return 'in progress';
}

function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [realSessions, setRealSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { toast } = useToast()
  
  // Form state for creating a new session
  const [newSessionName, setNewSessionName] = useState("")
  const [newSessionStartTime, setNewSessionStartTime] = useState("09:00")
  const [newSessionEndTime, setNewSessionEndTime] = useState("10:00")
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [newSessionLocation, setNewSessionLocation] = useState("Main Pool")
  const [newSessionMaxAttendees, setNewSessionMaxAttendees] = useState(20)
  const [newSessionDescription, setNewSessionDescription] = useState("")
  const [selectedDays, setSelectedDays] = useState<number[]>([]) // No default days selected
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringEndDate, setRecurringEndDate] = useState(
    new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 4 weeks from now
  )
  
  // Helper function to generate hourly and half-hour time options
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0')
      options.push(`${hourString}:00`)
      options.push(`${hourString}:30`)
    }
    return options
  }
  
  // Fetch real sessions from Firebase on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const sessions = await getSessions()
        setRealSessions(sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sessions. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessions()
  }, [])

  // Get the start of the week (Sunday)
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Get array of dates for the week
  const getWeekDates = () => {
    const startOfWeek = getStartOfWeek(currentWeek)
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  // Log sessions from Firebase to understand their structure
  useEffect(() => {
    if (!loading && realSessions.length > 0) {
      console.log('Sessions from Firebase:', realSessions);
    }
  }, [loading, realSessions]);

  // Get schedule data from the database
  const scheduleData: ScheduleSession[] = realSessions.map(session => {
    // Convert Firebase session to display format
    const startTime = new Date(session.startTime)
    const endTime = new Date(session.endTime)
    
    // Ensure selectedDays is properly processed - convert from any format it might be in
    let selectedDays: number[] = [];
    if (session.selectedDays) {
      // If it's an array, use it directly
      if (Array.isArray(session.selectedDays)) {
        selectedDays = session.selectedDays as number[];
      } 
      // If it's an object with numeric keys (Firebase sometimes converts arrays to objects)
      else if (typeof session.selectedDays === 'object') {
        selectedDays = Object.values(session.selectedDays).map(Number);
      }
    }
    
    return {
      id: session.id,
      name: session.name,
      time: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
      location: session.location || 'Main Pool',
      // Use the selected days from the session, or default to the day of the week if not specified
      days: selectedDays.length > 0 ? selectedDays : [new Date(session.startTime).getDay()]
    } as ScheduleSession
  })

  // Get sessions for a specific day
  const getSessionsForDay = (dayIndex: number): ScheduleSession[] => {
    if (loading) return [];
    return scheduleData.filter((session) => {
      // Check if this session applies to this day of the week
      if (!session.days.includes(dayIndex)) {
        return false;
      }
      
      // For recurring sessions, check if the date is within the recurrence range
      const sessionStart = new Date(realSessions.find(s => s.id === session.id)?.startTime || '');
      const sessionDate = new Date(sessionStart);
      const dayDate = weekDates[dayIndex];
      
      // If it's a one-time session, it should match the exact date
      const sourceSession = realSessions.find(s => s.id === session.id);
      if (!sourceSession?.isRecurring) {
        // Non-recurring events only appear on their specific date
        return sessionDate.toDateString() === dayDate.toDateString();
      } else {
        // For recurring sessions, check if the day is within the recurrence range
        const recurringEndDate = sourceSession.recurringEndDate ? new Date(sourceSession.recurringEndDate) : null;
        return (!recurringEndDate || dayDate <= recurringEndDate);
      }
    });
  }

  return (
    <div className="pb-20 p-4">
      {/* Back arrow for navigation to dashboard */}
      <HomeButton />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-cyan-200 bg-white/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-900">Schedule</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="h-9 w-9 border-cyan-200">
                <Plus className="h-5 w-5 text-cyan-700" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  console.log('Submit button clicked. Starting form submission process.')
                  
                  // Show immediate visual feedback
                  toast({
                    title: "Processing",
                    description: "Adding session to schedule...",
                    variant: "default"
                  })
                  
                  try {
                    // Create the date-time values from the form inputs
                    const startDateTime = new Date(`${newSessionDate}T${newSessionStartTime}:00`)
                    const endDateTime = new Date(`${newSessionDate}T${newSessionEndTime}:00`)
                    
                    // Validate time range
                    if (endDateTime <= startDateTime) {
                      toast({
                        variant: "destructive",
                        title: "Invalid Time Range",
                        description: "End time must be after start time",
                      })
                      return
                    }
                    
                    // Validate we have at least one day selected
                    console.log('Selected days:', selectedDays)
                    if (selectedDays.length === 0) {
                      // Automatically select the day corresponding to the chosen date
                      const selectedDateDay = new Date(newSessionDate).getDay()
                      console.log('Auto-selecting day of session date:', selectedDateDay)
                      setSelectedDays([selectedDateDay])
                      
                      // Show toast that we automatically selected the day
                      toast({
                        variant: "default",
                        title: "Day Auto-Selected",
                        description: "We've selected the day that matches your chosen date."
                      })
                    }
                    
                    // Validate recurring end date if recurring is enabled
                    if (isRecurring) {
                      const endDate = new Date(recurringEndDate)
                      const startDate = new Date(newSessionDate)
                      if (endDate <= startDate) {
                        toast({
                          variant: "destructive",
                          title: "Invalid End Date",
                          description: "End date must be after start date for recurring events"
                        })
                        return
                      }
                    }

                    // Create session data object with proper typing - handle recurringEndDate properly for Firestore
                    const sessionData: Omit<Session, 'id'> = {
                      name: newSessionName,
                      startTime: startDateTime.toISOString(),
                      endTime: endDateTime.toISOString(),
                      location: newSessionLocation,
                      maxAttendees: newSessionMaxAttendees,
                      description: newSessionDescription || "Regular swimming session",
                      selectedDays: selectedDays,
                      isRecurring: isRecurring
                    }
                    
                    // Only add recurringEndDate if it's a recurring event
                    // This prevents sending 'undefined' which Firestore doesn't accept
                    if (isRecurring) {
                      // Using type assertion to add optional property
                      (sessionData as any).recurringEndDate = recurringEndDate;
                    }
                    
                    console.log('About to add session with data:', JSON.stringify(sessionData, null, 2))
                    // Create the session directly using the session service
                    const newSession = await addSession(sessionData)
                    console.log('Session created successfully:', newSession)
                    
                    // Add the new session to state
                    setRealSessions(prev => [...prev, newSession])
                    
                    // Reset form fields
                    setNewSessionName('')
                    setNewSessionDate(new Date().toISOString().split('T')[0])
                    setNewSessionStartTime('09:00')
                    setNewSessionEndTime('10:00')
                    setNewSessionLocation('Main Pool')
                    setNewSessionDescription('')
                    setSelectedDays([])
                    setIsRecurring(false)
                    setRecurringEndDate(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                    
                    // Add toast notification with more visible styling
                    console.log('Displaying success toast notification')
                    toast({
                      title: "Success!",
                      description: "Session created successfully and added to schedule",
                      variant: "default",
                      className: "bg-green-100 border border-green-500 text-green-800"
                    })
                    
                    // Close the dialog after success
                    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement;
                    if (closeButton) {
                      closeButton.click();
                    }
                  } catch (error) {
                    console.error('Error creating session:', error)
                    // More detailed error logging
                    if (error instanceof Error) {
                      console.error('Error message:', error.message)
                      console.error('Error stack:', error.stack)
                    }
                    
                    // Add toast notification for error
                    console.log('Displaying error toast notification')
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: error instanceof Error ? error.message : 'Failed to create session',
                    })
                  }
                }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-name">Session Name</Label>
                      <Input 
                        id="session-name" 
                        className="border-cyan-200" 
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Morning Swim Class"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="session-date">Date</Label>
                      <Input 
                        id="session-date" 
                        type="date" 
                        className="border-cyan-200"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Select value={newSessionStartTime} onValueChange={setNewSessionStartTime}>
                          <SelectTrigger id="start-time" className="border-cyan-200">
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().map(time => (
                              <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Select value={newSessionEndTime} onValueChange={setNewSessionEndTime}>
                          <SelectTrigger id="end-time" className="border-cyan-200">
                            <SelectValue placeholder="Select end time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().map(time => (
                              <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        className="border-cyan-200" 
                        value={newSessionLocation}
                        onChange={(e) => setNewSessionLocation(e.target.value)}
                        placeholder="Main Pool"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-attendees">Max Attendees</Label>
                      <Input 
                        id="max-attendees" 
                        type="number" 
                        min="1"
                        className="border-cyan-200"
                        value={newSessionMaxAttendees}
                        onChange={(e) => setNewSessionMaxAttendees(parseInt(e.target.value) || 20)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Days of Week</Label>
                      <div className="flex flex-wrap gap-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <div
                            key={i}
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border ${selectedDays.includes(i) ? 'bg-cyan-100 border-cyan-500' : 'border-cyan-200'} text-sm font-medium text-cyan-700 hover:bg-cyan-50`}
                            onClick={() => {
                              setSelectedDays(prev => 
                                prev.includes(i) 
                                  ? prev.filter(d => d !== i) 
                                  : [...prev, i]
                              );
                            }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is-recurring"
                          className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                        />
                        <Label htmlFor="is-recurring" className="cursor-pointer">
                          Make this a recurring event
                        </Label>
                      </div>
                    </div>

                    {isRecurring && (
                      <div className="space-y-2">
                        <Label htmlFor="recurring-end-date">Recurring Until</Label>
                        <Input
                          id="recurring-end-date"
                          type="date"
                          className="border-cyan-200"
                          value={recurringEndDate}
                          onChange={(e) => setRecurringEndDate(e.target.value)}
                          min={newSessionDate} // Can't end before it starts
                          required={isRecurring}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input 
                        id="description" 
                        className="border-cyan-200"
                        value={newSessionDescription}
                        onChange={(e) => setNewSessionDescription(e.target.value)}
                        placeholder="Regular swimming class"
                      />
                    </div>
                    
                    <Button type="submit" className="mt-2 bg-cyan-600 hover:bg-cyan-700 relative group">
                      <span>Add Session</span>
                      <span className="absolute inset-0 h-full w-full flex items-center justify-center bg-cyan-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                        Click to Add
                      </span>
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-cyan-700" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-medium text-cyan-900">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </h2>
          <Button variant="ghost" size="sm" className="text-cyan-700" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Tabs */}
        <div className="mt-4 grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            // Calculate styling based on if this date is today or selected
            const isDateToday = isToday(date);
            const isDateSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center rounded-md p-2 text-center cursor-pointer ${
                  isDateSelected 
                    ? "bg-cyan-600 text-white" 
                    : isDateToday 
                      ? "bg-cyan-200 text-cyan-900 border border-cyan-400" 
                      : "text-cyan-900 hover:bg-cyan-50"
                }`}
              >
                <div className="text-xs font-medium">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}
                </div>
                <div className={`text-lg font-bold ${
                  isDateSelected 
                    ? "text-white" 
                    : "text-cyan-700"
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Schedule Content */}
      <main className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-700 mb-4"></div>
            <p className="text-cyan-700">Loading schedule data...</p>
          </div>
        ) : realSessions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-cyan-700">No sessions found. Create a new session to get started.</p>
          </div>
        ) : null}
        
        {/* Display sessions for the selected date only */}
        {!loading && (
          <div className="mb-6">
            <h2 className="mb-3 text-base font-medium text-cyan-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            
            {/* Get sessions for the selected date */}
            {(() => {
              // Debug log the current state
              console.log('Selected date:', selectedDate);
              console.log('Schedule data:', scheduleData);
              console.log('Real sessions:', realSessions);
              
              // Filter sessions specifically for this selected date
              const sessionsForSelectedDate = scheduleData.filter(session => {
                // First check if this session is for this day of the week
                const dayOfWeek = selectedDate.getDay();
                if (!session.days.includes(dayOfWeek)) {
                  return false;
                }
                
                // Get the original session data
                const sourceSession = realSessions.find(s => s.id === session.id);
                if (!sourceSession) return false;
                
                const sessionStartDate = new Date(sourceSession.startTime);
                
                // Check if it's a recurring session - normalize different formats from Firebase
                const isRecurringSession = sourceSession.isRecurring === true || 
                  (typeof sourceSession.isRecurring === 'string' && (sourceSession.isRecurring as string).toLowerCase() === 'true');
                
                // If it's not recurring, only show on the exact date
                if (!isRecurringSession) {
                  const sameDate = 
                    sessionStartDate.getDate() === selectedDate.getDate() &&
                    sessionStartDate.getMonth() === selectedDate.getMonth() &&
                    sessionStartDate.getFullYear() === selectedDate.getFullYear();
                  
                  console.log(`Session ${sourceSession.name} is not recurring:`, {
                    sessionDate: sessionStartDate.toDateString(),
                    selectedDate: selectedDate.toDateString(),
                    matches: sameDate
                  });
                  
                  return sameDate;
                } 
                // It's a recurring session
                else {
                  // The session start date must be on or before the selected date
                  const isAfterOrOnStart = selectedDate >= sessionStartDate;
                  
                  // Check end date if it exists
                  if (sourceSession.recurringEndDate) {
                    // Parse end date, accounting for different possible formats
                    let recurringEndDate;
                    try {
                      recurringEndDate = new Date(sourceSession.recurringEndDate);
                    } catch (e) {
                      console.error('Error parsing recurring end date:', e);
                      recurringEndDate = null;
                    }
                    
                    const isBeforeOrOnEnd = !recurringEndDate || selectedDate <= recurringEndDate;
                    
                    console.log(`Session ${sourceSession.name} is recurring with end date:`, {
                      sessionStartDate: sessionStartDate.toDateString(),
                      recurringEndDate: recurringEndDate?.toDateString(),
                      selectedDate: selectedDate.toDateString(),
                      isAfterOrOnStart,
                      isBeforeOrOnEnd,
                      matches: isAfterOrOnStart && isBeforeOrOnEnd
                    });
                    
                    return isAfterOrOnStart && isBeforeOrOnEnd;
                  }
                  
                  // If no end date, just check it's after start
                  console.log(`Session ${sourceSession.name} is recurring without end date:`, {
                    sessionStartDate: sessionStartDate.toDateString(),
                    selectedDate: selectedDate.toDateString(),
                    isAfterOrOnStart,
                    matches: isAfterOrOnStart
                  });
                  
                  return isAfterOrOnStart;
                }
              });
              
              if (sessionsForSelectedDate.length === 0) {
                return (
                  <div className="text-center py-6 bg-white/60 rounded-md shadow-sm border border-cyan-100">
                    <p className="text-cyan-700">No sessions scheduled for this date.</p>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  {sessionsForSelectedDate.map((session) => (
                    <SessionCard
                      key={session.id}
                      id={session.id}
                      name={session.name}
                      time={session.time}
                      location={session.location}
                      isToday={isToday(selectedDate)}
                      status={getSessionStatus(session.time)}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  )
}

// Apply authentication protection to the schedule page
export default withAuth(SchedulePage)

interface SessionCardProps {
  id: string;
  name: string;
  time: string;
  location: string;
  isToday: boolean;
}

function SessionCard({ id, name, time, location, isToday, status }: SessionCardProps) {
  return (
    <Card className={`overflow-hidden ${isToday ? "border-cyan-400 bg-cyan-50" : "bg-white/80 backdrop-blur"}`}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex h-full w-2 ${isToday ? "bg-cyan-400" : "bg-cyan-200"}`}></div>
          <div className="flex flex-1 items-center justify-between p-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-cyan-900">{name}</span>
                {status && (
                  <div className={`text-xs px-2 py-1 rounded-full ${status === 'in progress' ? 'bg-cyan-200 text-cyan-800' : status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {status}
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-col text-xs text-cyan-600 sm:flex-row sm:gap-2">
                <span>{time}</span>
                <span className="hidden sm:inline">•</span>
                <span>{location}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-700">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <path
                      d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-session-name">Session Name</Label>
                        <Input id="edit-session-name" className="border-cyan-200" defaultValue={name} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-start-time">Start Time</Label>
                          <Input
                            id="edit-start-time"
                            type="time"
                            className="border-cyan-200"
                            defaultValue={time.split(" - ")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-end-time">End Time</Label>
                          <Input
                            id="edit-end-time"
                            type="time"
                            className="border-cyan-200"
                            defaultValue={time.split(" - ")[1]}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-location">Location</Label>
                        <Input id="edit-location" className="border-cyan-200" defaultValue={location} />
                      </div>
                      <div className="space-y-2">
                        <Label>Days of Week</Label>
                        <div className="flex flex-wrap gap-2">
                          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                            <div
                              key={i}
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-cyan-200 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="mt-2 bg-cyan-600 hover:bg-cyan-700">Update Session</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the session "{name}" from your schedule.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

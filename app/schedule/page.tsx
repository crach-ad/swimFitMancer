"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Get the start of the week (Sunday)
  const getStartOfWeek = (date) => {
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
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Check if date is today
  const isToday = (date) => {
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

  // Mock schedule data
  const scheduleData = [
    {
      id: 1,
      name: "Morning Lap Swim",
      time: "07:00 - 08:00",
      location: "Main Pool",
      days: [0, 1, 2, 3, 4], // Sunday to Thursday
    },
    {
      id: 2,
      name: "Beginner Technique",
      time: "09:30 - 10:30",
      location: "Training Pool",
      days: [1, 3, 5], // Monday, Wednesday, Friday
    },
    {
      id: 3,
      name: "Advanced Training",
      time: "16:00 - 17:30",
      location: "Olympic Pool",
      days: [2, 4, 6], // Tuesday, Thursday, Saturday
    },
    {
      id: 4,
      name: "Kids Swimming",
      time: "14:00 - 15:00",
      location: "Training Pool",
      days: [5, 6], // Friday, Saturday
    },
  ]

  // Get sessions for a specific day
  const getSessionsForDay = (dayIndex) => {
    return scheduleData.filter((session) => session.days.includes(dayIndex))
  }

  return (
    <div className="pb-20">
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
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input id="session-name" className="border-cyan-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input id="start-time" type="time" className="border-cyan-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input id="end-time" type="time" className="border-cyan-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" className="border-cyan-200" />
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
                <Button className="mt-2 bg-cyan-600 hover:bg-cyan-700">Add Session</Button>
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
          {weekDates.map((date, i) => (
            <div
              key={i}
              className={`flex flex-col items-center rounded-md p-2 text-center ${
                isToday(date) ? "bg-cyan-600 text-white" : "text-cyan-900"
              }`}
            >
              <div className="text-xs font-medium">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}
              </div>
              <div className={`text-lg font-bold ${isToday(date) ? "text-white" : "text-cyan-700"}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Schedule Content */}
      <main className="p-4">
        {weekDates.map((date, dayIndex) => {
          const sessions = getSessionsForDay(date.getDay())
          if (sessions.length === 0) return null

          return (
            <div key={dayIndex} className="mb-6">
              <h2 className="mb-3 text-base font-medium text-cyan-900">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]}
              </h2>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    id={session.id}
                    name={session.name}
                    time={session.time}
                    location={session.location}
                    isToday={isToday(date)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}

function SessionCard({ id, name, time, location, isToday }) {
  return (
    <Card className={`overflow-hidden ${isToday ? "border-cyan-400 bg-cyan-50" : "bg-white/80 backdrop-blur"}`}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`flex h-full w-2 ${isToday ? "bg-cyan-400" : "bg-cyan-200"}`}></div>
          <div className="flex flex-1 items-center justify-between p-3">
            <div>
              <div className="font-medium text-cyan-900">{name}</div>
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

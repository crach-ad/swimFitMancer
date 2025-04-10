"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, QrCode, Scan, Share2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { QrScanner } from "@/components/qr-scanner"
import { recordAttendance } from "@/lib/attendance-service"
import { getSessionById } from "@/lib/session-service"
import { toast } from "@/components/ui/use-toast"
import QRCode from "qrcode.react"

export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [selectedSession, setSelectedSession] = useState("beginner-technique")
  const [codeType, setCodeType] = useState("attendance")
  const [sessions, setSessions] = useState([
    {
      id: "morning-lap",
      name: "Morning Lap Swim",
      timeRange: "07:00 - 08:00",
      location: "Competition Pool"
    },
    {
      id: "beginner-technique",
      name: "Beginner Technique",
      timeRange: "09:30 - 10:30",
      location: "Training Pool"
    },
    {
      id: "advanced-training",
      name: "Advanced Training",
      timeRange: "16:00 - 17:30",
      location: "Competition Pool"
    }
  ])
  
  // Load sessions from the database on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        if (response.ok) {
          const data = await response.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions.map(session => ({
              id: session.id,
              name: session.name,
              timeRange: `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`,
              location: session.location
            })));
            setSelectedSession(data.sessions[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    };
    
    loadSessions();
  }, []);
  
  // Format time for display
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return isoString;
    }
  };
  
  // Generate QR code data
  const getQrCodeData = () => {
    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return "";
    
    const data = {
      type: codeType,
      sessionId: session.id,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data);
  };
  
  // Handle QR code scan
  const handleScanSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (!data.type || !data.sessionId) {
        throw new Error("Invalid QR code format");
      }
      
      if (data.type === "attendance") {
        // In a real app, you would use the authenticated user's client ID
        // For now, we'll use a placeholder client ID
        const clientId = "client_placeholder";
        
        // Verify session exists
        const session = await getSessionById(data.sessionId);
        if (!session) {
          throw new Error("Session not found");
        }
        
        // Record attendance
        const result = await recordAttendance(clientId, data.sessionId);
        
        if (!result) {
          throw new Error("Failed to record attendance");
        }
        
        toast({
          title: "Check-in Successful",
          description: `You have checked in to ${session.name}`,
        });
      } else {
        toast({
          title: "QR Code Scanned",
          description: `Scanned a ${data.type} QR code for session ID: ${data.sessionId}`,
        });
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process QR code",
      });
      throw error;
    }
  };
  
  // Get current selected session details
  const currentSession = sessions.find(s => s.id === selectedSession);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-cyan-50 to-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-cyan-200 bg-white/80 p-4 backdrop-blur">
        <div className="flex items-center">
          <Link href="/" className="mr-3">
            <ArrowLeft className="h-5 w-5 text-cyan-700" />
          </Link>
          <h1 className="text-xl font-bold text-cyan-900">
            {activeTab === "generate" ? "QR Code Generator" : "QR Code Scanner"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan
            </TabsTrigger>
          </TabsList>
          
          {/* Generate Tab Content */}
          <TabsContent value="generate" className="mt-4">
            <Card className="mb-6 bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="mb-4 space-y-2">
                  <Label htmlFor="session-select" className="text-cyan-700">
                    Select Session
                  </Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger id="session-select" className="border-cyan-200">
                      <SelectValue placeholder="Select a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name} ({session.timeRange})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4 space-y-2">
                  <Label htmlFor="code-type" className="text-cyan-700">
                    QR Code Type
                  </Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger id="code-type" className="border-cyan-200">
                      <SelectValue placeholder="Select code type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance Check-in</SelectItem>
                      <SelectItem value="session-details">Session Details</SelectItem>
                      <SelectItem value="feedback">Session Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative mb-4 rounded-lg bg-white p-4 shadow-md">
                {/* Generated QR code */}
                <QRCode 
                  value={getQrCodeData()} 
                  size={256} 
                  level="H"
                  renderAs="canvas"
                  includeMargin={true}
                />

                {/* Water-themed decorative elements */}
                <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-cyan-400 opacity-20"></div>
                <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-cyan-500 opacity-20"></div>
                <div className="absolute -bottom-1 right-6 h-4 w-4 rounded-full bg-blue-400 opacity-20"></div>
              </div>

              <div className="text-center">
                {currentSession && (
                  <>
                    <h2 className="text-lg font-semibold text-cyan-900">{currentSession.name}</h2>
                    <p className="text-cyan-600">{currentSession.timeRange} • {currentSession.location}</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-cyan-600 text-white hover:bg-cyan-700">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Instructions */}
            <Card className="mt-6 border-cyan-200 bg-cyan-50">
              <CardContent className="p-4 text-sm text-cyan-800">
                <p className="font-medium">How to use:</p>
                <ol className="ml-5 mt-2 list-decimal space-y-1">
                  <li>Display this QR code on a screen or print it out</li>
                  <li>Ask clients to scan the code with their SwimFit app</li>
                  <li>Attendance will be automatically logged to the database</li>
                  <li>View real-time attendance updates on your dashboard</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Scan Tab Content */}
          <TabsContent value="scan" className="mt-4">
            <Card className="mb-6">
              <CardContent className="p-4">
                <QrScanner onScanSuccess={handleScanSuccess} />
              </CardContent>
            </Card>
            
            {/* Instructions */}
            <Card className="mt-6 border-cyan-200 bg-cyan-50">
              <CardContent className="p-4 text-sm text-cyan-800">
                <p className="font-medium">How to scan:</p>
                <ol className="ml-5 mt-2 list-decimal space-y-1">
                  <li>Click "Start Scanning" to activate the camera</li>
                  <li>Position the QR code within the scanning area</li>
                  <li>Hold steady until the code is recognized</li>
                  <li>The system will automatically record your attendance</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

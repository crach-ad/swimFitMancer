"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Client } from "@/lib/client-service"
import withAuth from "@/lib/firebase/with-auth"
import { HomeButton } from "@/components/home-button"

function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "Beginner",
    notes: "",
    packageLimit: 10, // Default package limit for new clients
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch clients from the database
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/clients")
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Deduplicate clients by ID to prevent React key errors
        const uniqueClients = Array.from(
          new Map(data.clients.map((client: Client) => [client.id, client])).values()
        ) as Client[]
        
        setClients(uniqueClients || [])
      } catch (error) {
        console.error("Failed to fetch clients:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch clients. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchClients()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // State for success animation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  
  // State for package limit adjustment
  const [newPackageLimit, setNewPackageLimit] = useState<number | null>(null)

  // Handle package limit update
  const handleUpdatePackageLimit = async (clientId: string) => {
    if (!newPackageLimit || newPackageLimit < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Value",
        description: "Please enter a valid package limit greater than 0.",
      })
      return
    }
    
    try {
      // Update client package limit in database
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageLimit: newPackageLimit }),
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      // Show success message
      toast({
        title: "Package Limit Updated",
        description: `Client's package limit has been set to ${newPackageLimit} sessions.`,
      })
      
      // Refresh client list to show updated data
      const updatedClientsResponse = await fetch("/api/clients")
      if (updatedClientsResponse.ok) {
        const data = await updatedClientsResponse.json()
        
        // Deduplicate clients by ID
        const uniqueClients = Array.from(
          new Map(data.clients.map((client: Client) => [client.id, client])).values()
        ) as Client[]
        
        setClients(uniqueClients || [])
      }
    } catch (error) {
      console.error("Failed to update package limit:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update package limit. Please try again.",
      })
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and email are required.",
      })
      return
    }
    
    try {
      setFormSubmitting(true)
      
      // Call API to add new client
      const response = await fetch("/api/clients/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isActive: true,
          sessionCount: 0, // Initialize session count to zero
          // QR code will be generated on the server side
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Update clients list with the new client
      setClients(prev => [...prev, result.client])
      
      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        phone: "",
        level: "Beginner",
        notes: "",
        packageLimit: 10,
      })
      setDialogOpen(false)
      
      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
      
      toast({
        title: "Success",
        description: "Client added successfully!",
      })
    } catch (error) {
      console.error("Failed to add client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add client. Please try again.",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Separate active and inactive clients
  const activeClients = filteredClients.filter((client) => client.isActive)
  const inactiveClients = filteredClients.filter((client) => !client.isActive)

  return (
    <div className="pb-20 p-4">
      {/* Back arrow for navigation to dashboard */}
      <HomeButton />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-cyan-200 bg-white/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-900">Clients</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="h-9 w-9 border-cyan-200">
                <Plus className="h-5 w-5 text-cyan-700" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      className="border-cyan-200" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      className="border-cyan-200" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      className="border-cyan-200" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Skill Level</Label>
                    <select
                      id="level"
                      name="level"
                      className="flex h-10 w-full rounded-md border border-cyan-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.level}
                      onChange={handleInputChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="flex min-h-[80px] w-full rounded-md border border-cyan-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Additional information about the client"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageLimit">Package Limit (Sessions)</Label>
                    <Input
                      id="packageLimit"
                      name="packageLimit"
                      type="number"
                      min="1"
                      className="border-cyan-200"
                      value={formData.packageLimit}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-cyan-600">Maximum number of sessions for this client</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="mt-2 bg-cyan-600 hover:bg-cyan-700"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Client'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and View All */}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Search clients..."
            className="border-cyan-200 bg-white text-cyan-900 placeholder:text-cyan-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            variant="outline" 
            className="shrink-0 border-cyan-200 bg-white text-cyan-900"
            onClick={() => setSearchQuery("")}
          >
            View All Clients
          </Button>
          <Button size="icon" variant="outline" className="h-10 w-10 shrink-0 border-cyan-200">
            <Filter className="h-5 w-5 text-cyan-700" />
          </Button>
        </div>
      </header>

      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-100 text-green-800 rounded-lg p-6 shadow-lg animate-bounce-once">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-lg font-semibold">Client Added Successfully!</span>
            </div>
          </div>
        </div>
      )}

      {/* Client List */}
      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            <span className="ml-2 text-cyan-800">Loading clients...</span>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              {activeClients.length > 0 ? (
                <div className="space-y-3">
                  {activeClients.map((client) => (
                    <ClientCard 
                      key={client.id} 
                      id={client.id}
                      name={client.name}
                      email={client.email}
                      phone={client.phone}
                      notes={client.notes}
                      qrCode={client.qrCode}
                      packageLimit={client.packageLimit}
                      sessionCount={client.sessionCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center text-cyan-600">No active clients found</div>
              )}
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              {inactiveClients.length > 0 ? (
                <div className="space-y-3">
                  {inactiveClients.map((client) => (
                    <ClientCard 
                      key={client.id} 
                      id={client.id}
                      name={client.name}
                      email={client.email}
                      phone={client.phone}
                      notes={client.notes}
                      qrCode={client.qrCode}
                      packageLimit={client.packageLimit}
                      sessionCount={client.sessionCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center text-cyan-600">No inactive clients found</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  isActive?: boolean;
  qrCode?: string;
  packageLimit?: number;
  sessionCount?: number;
}

function ClientCard({ id, name, email, phone, notes, qrCode, packageLimit = 10, sessionCount = 0 }: ClientCardProps) {
  // State for package limit adjustment
  const [newPackageLimit, setNewPackageLimit] = useState<number>(packageLimit);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Helper function to check if the client has notes
  const hasNotes = notes && notes.trim().length > 0;
  
  // Calculate package usage percentage
  const packageUsage = packageLimit > 0 ? (sessionCount / packageLimit) * 100 : 0;
  
  // Determine if client is approaching package limit
  const isApproachingLimit = packageUsage >= 80;
  
  // Generate badge class for notes
  const getNoteBadgeClass = () => {
    return "bg-cyan-100 text-cyan-700";
  }
  
  // Generate badge class for package status
  const getPackageBadgeClass = () => {
    if (packageUsage >= 90) return "bg-red-100 text-red-700";
    if (packageUsage >= 75) return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  }
  
  // Handle package limit update
  const handleUpdatePackageLimit = async (clientId: string) => {
    if (!newPackageLimit || newPackageLimit < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Value",
        description: "Please enter a valid package limit greater than 0.",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Update client package limit in database
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageLimit: newPackageLimit }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Show success message
      toast({
        title: "Package Limit Updated",
        description: `Package limit has been set to ${newPackageLimit} sessions.`,
      });
      
      // Update the package limit in the UI
      // This will trigger a page refresh
      window.location.reload();
    } catch (error) {
      console.error("Failed to update package limit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update package limit. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden bg-white/80 backdrop-blur hover:bg-cyan-50 cursor-pointer transition-colors">
          <CardContent className="p-0">
            <div className="flex items-center p-3">
              <Avatar className="h-10 w-10 border border-cyan-200">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={name} />
                <AvatarFallback className="bg-cyan-100 text-cyan-700">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-cyan-900">{name}</div>
                  {qrCode && (
                    <QRCodeDisplay 
                      clientId={id}
                      clientName={name}
                      qrCodeDataUrl={qrCode}
                    />
                  )}
                </div>
                <div className="mt-1 flex items-center">
                  {hasNotes && (
                    <Badge variant="outline" className={`mr-2 ${getNoteBadgeClass()}`}>
                      Has Notes
                    </Badge>
                  )}
                  {packageLimit && (
                    <Badge variant="outline" className={`mr-2 ${getPackageBadgeClass()}`}>
                      {sessionCount}/{packageLimit} Sessions
                    </Badge>
                  )}
                  <div className="text-xs text-cyan-600">
                    {email}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Client Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20 border-2 border-cyan-200">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt={name} />
            <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xl">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-2 text-xl font-bold text-cyan-900">{name}</h2>
          <div className="mt-2 flex items-center gap-2">
            {hasNotes && (
              <Badge variant="outline" className={getNoteBadgeClass()}>
                Has Notes
              </Badge>
            )}
          </div>
          
          {/* Package information */}
          {packageLimit > 0 && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-cyan-700">Package Usage:</span>
                <span className="font-medium">{sessionCount}/{packageLimit} Sessions</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${packageUsage >= 90 ? 'bg-red-500' : packageUsage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(packageUsage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-end mt-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs border-cyan-200 text-cyan-700"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the client card dialog from closing
                      }}
                    >
                      Adjust Package Limit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adjust Package Limit</DialogTitle>
                      <DialogDescription>
                        Update the maximum number of sessions for this client's package.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="packageLimit" className="text-right">
                          Current Limit
                        </Label>
                        <Input
                          id="currentLimit"
                          value={packageLimit || 0}
                          className="col-span-3"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newLimit" className="text-right">
                          New Limit
                        </Label>
                        <Input
                          id="newLimit"
                          type="number"
                          defaultValue={packageLimit || 10}
                          min={1}
                          className="col-span-3"
                          onChange={(e) => setNewPackageLimit(parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sessionCount" className="text-right">
                          Sessions Used
                        </Label>
                        <Input
                          id="sessionCount"
                          value={sessionCount || 0}
                          className="col-span-3"
                          disabled
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={() => handleUpdatePackageLimit(id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* QR code moved to bottom of profile */}

          <div className="mt-6 w-full space-y-4">
            <div className="grid grid-cols-1 gap-4 text-center">
              {hasNotes && (
                <div className="rounded-lg bg-cyan-50 p-3">
                  <div className="text-sm text-cyan-600">Notes</div>
                  <div className="text-sm text-cyan-700">
                    {/* Remove any sessions attended text that might still be in notes */}
                    {notes?.replace(/\s*\|?\s*Sessions attended: \d+/, '') || 'No notes available'}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-cyan-200 p-3">
              <h3 className="mb-2 font-medium text-cyan-900">Contact Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-600">Email:</span>
                  <span className="text-cyan-900">{email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">Phone:</span>
                  <span className="text-cyan-900">{phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">Emergency Contact:</span>
                  <span className="text-cyan-900">N/A</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-200 p-3">
              <h3 className="mb-2 font-medium text-cyan-900">Recent Sessions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-900">Beginner Technique</span>
                  <span className="text-cyan-600">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-900">Morning Lap Swim</span>
                  <span className="text-cyan-600">Yesterday</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-900">Advanced Training</span>
                  <span className="text-cyan-600">Apr 8</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">Edit Profile</Button>
              <Button variant="outline" className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                View History
              </Button>
            </div>
            
            {/* Large QR code section at bottom - simply displays QR code */}
            <div className="mt-8 rounded-lg border border-cyan-200 p-4">
              <h3 className="mb-3 text-center font-medium text-cyan-900">Client QR Code</h3>
              <div className="flex flex-col items-center">
                <div className="relative h-72 w-72 overflow-hidden rounded-lg border-2 border-cyan-200">
                  {qrCode ? (
                    <img 
                      src={qrCode} 
                      alt={`QR code for ${name}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                      <p className="text-center text-gray-400 p-4">No QR code available</p>
                    </div>
                  )}
                </div>
                {qrCode && (
                  <>
                    <p className="mt-3 text-center text-sm text-cyan-600">
                      Use this QR code for quick attendance check-ins
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = qrCode;
                          link.download = `${name.replace(/\s+/g, '_')}_QRCode.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download QR Code
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Apply authentication protection to the clients page
export default withAuth(ClientsPage);

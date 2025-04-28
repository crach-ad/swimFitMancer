"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import withAuth from "@/lib/firebase/with-auth";
import { useAuth } from "@/lib/firebase/auth-context";
import { getSessions, type Session } from "@/lib/session-service";
import { getClients, type Client } from "@/lib/client-service";
import { getAuth, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Bell, Users, AlertTriangle } from "lucide-react";

// Dashboard component with animations
function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/auth/login");
    } else {
      // Get user name from Firebase or localStorage
      if (user.displayName) {
        setUserName(user.displayName);
        // Save display name for future welcome messages
        localStorage.setItem('lastLoginUser', user.displayName);
      } else {
        // Try to get name from localStorage if Firebase profile doesn't have it
        const storedName = localStorage.getItem('lastLoginUser');
        if (storedName) {
          setUserName(storedName);
        }
      }
    }
  }, [user, router]);

  // Fetch sessions from Firebase
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const allSessions = await getSessions();
        
        // Sort sessions by start time
        const sortedSessions = allSessions.sort((a, b) => {
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Filter out sessions that have already happened
        const now = new Date();
        const upcomingSessions = sortedSessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= now;
        });
        
        // Get the next 3 upcoming sessions
        const nextSessions = upcomingSessions.slice(0, 3);
        setSessions(nextSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Fetch clients for package limit notifications
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const allClients = await getClients();
        setClients(allClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setClientsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with welcome message */}
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold text-slate-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {userName 
              ? `Welcome back, ${userName}!` 
              : user?.email 
                ? `Welcome back, ${user.email.split('@')[0]}!` 
                : "Welcome back!"}
          </motion.p>
          <motion.p 
            className="text-xs text-slate-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </motion.p>
        </div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              // Sign out and redirect to login
              if (confirm('Are you sure you want to sign out?')) {
                try {
                  // Sign out from Firebase
                  const auth = getAuth();
                  await signOut(auth);
                  
                  // Navigate to login page
                  router.push('/auth/login');
                } catch (error) {
                  console.error('Error signing out:', error);
                  router.push('/auth/login');
                }
              }
            }}
            className="group cursor-pointer hidden md:block relative"
            aria-label="Sign out and return to login"
          >
            <Image
              src="/images/swimfit-logo.png"
              alt="SwimFit Logo"
              width={120}
              height={50}
              className="transition-opacity group-hover:opacity-80"
            />
            <span className="text-xs text-cyan-700 absolute -bottom-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              Sign out
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Main content area */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* First column - schedule summary */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2"
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Class items */}
                {loading ? (
                  // Show skeletons while loading
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <div className="w-full">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  ))
                ) : sessions.length > 0 ? (
                  // Show actual sessions
                  sessions.map((session, index) => {
                    // Format date and time
                    const sessionDate = new Date(session.startTime);
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    // Format date display
                    let dateDisplay = '';
                    if (sessionDate.toDateString() === now.toDateString()) {
                      dateDisplay = 'Today';
                    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
                      dateDisplay = 'Tomorrow';
                    } else {
                      dateDisplay = sessionDate.toLocaleDateString('en-US', { weekday: 'long' });
                    }
                    
                    // Format time
                    const timeDisplay = sessionDate.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    });
                    
                    return (
                      <motion.div 
                        key={session.id} 
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-all"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        whileHover={{ scale: 1.01, x: 3 }}
                      >
                        <div>
                          <p className="font-medium text-slate-800">{session.name}</p>
                          <p className="text-sm text-slate-500">
                            {dateDisplay}, {timeDisplay} · {session.location}
                          </p>
                        </div>
                        <motion.div 
                          className="text-sm font-medium px-3 py-1 rounded-full bg-sky-100 text-sky-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          {session.maxAttendees ? `${session.maxAttendees} max` : 'Open'}
                        </motion.div>
                      </motion.div>
                    );
                  })
                ) : (
                  // Show message if no upcoming sessions
                  <div className="text-center p-4 text-slate-500">
                    No upcoming classes scheduled.
                  </div>
                )}
                <div className="mt-4">
                  <motion.button 
                    onClick={() => router.push('/schedule')} 
                    className="text-sm text-sky-600 hover:text-sky-800 font-medium"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    View full schedule →
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Second column - notifications and quick access */}
        <motion.div
          variants={itemVariants}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Package Notifications</CardTitle>
              <Bell className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div>
                  {/* Filter clients approaching or exceeding package limits */}
                  {(() => {
                    console.log('All clients:', clients);
                    
                    // Enhanced filtering to catch more notification scenarios
                    const notificationClients = clients.filter(client => {
                      // Skip clients without package limit set
                      if (!client.packageLimit || client.packageLimit <= 0) return false;
                      
                      // Ensure sessionCount exists (default to 0 if not set)
                      const sessionCount = client.sessionCount || 0;
                      
                      // Calculate usage percentage
                      const usagePercentage = (sessionCount / client.packageLimit) * 100;
                      console.log(`Client ${client.name}: ${sessionCount}/${client.packageLimit} = ${usagePercentage.toFixed(1)}%`);
                      
                      // Show notifications for clients at 70% or more of their package limit
                      // Lowered threshold slightly to catch more notifications
                      return usagePercentage >= 70;
                    });
                    
                    console.log('Notification clients:', notificationClients);
                    
                    if (notificationClients.length === 0) {
                      return (
                        <div className="text-center py-4 text-slate-500">
                          <p>No package limit notifications.</p>
                          <p className="text-xs mt-2">Notifications appear when clients reach 70% of their package limit</p>
                        </div>
                      );
                    }
                    
                    // Sort by usage percentage (highest first)
                    notificationClients.sort((a, b) => {
                      const usageA = ((a.sessionCount || 0) / (a.packageLimit || 1)) * 100;
                      const usageB = ((b.sessionCount || 0) / (b.packageLimit || 1)) * 100;
                      return usageB - usageA;
                    });
                    
                    return (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                        {notificationClients.map((client) => {
                          // Calculate values with proper defaults
                          const sessionCount = client.sessionCount || 0;
                          const packageLimit = client.packageLimit || 10;
                          const usagePercentage = (sessionCount / packageLimit) * 100;
                          const formattedPercentage = usagePercentage.toFixed(0);
                          
                          // Determine status categories
                          const isExceeded = usagePercentage >= 100;
                          const isWarning = usagePercentage >= 90 && usagePercentage < 100;
                          const isApproaching = usagePercentage >= 70 && usagePercentage < 90;
                          
                          // Color schemes based on status
                          const colorScheme = isExceeded ? 'bg-red-50 border-l-4 border-red-500' : 
                                             isWarning ? 'bg-amber-50 border-l-4 border-amber-500' : 
                                                        'bg-blue-50 border-l-4 border-blue-500';
                                                        
                          const textColor = isExceeded ? 'text-red-600' : 
                                          isWarning ? 'text-amber-600' : 
                                                     'text-blue-600';
                                                     
                          const badgeClass = isExceeded ? 'bg-red-100 text-red-800' : 
                                           isWarning ? 'bg-amber-100 text-amber-800' : 
                                                      'bg-blue-100 text-blue-800';
                                                      
                          const statusText = isExceeded ? 'Exceeded' : 
                                           isWarning ? 'Almost Full' : 
                                                      'Approaching';
                          
                          return (
                            <motion.div 
                              key={client.id}
                              className={`p-3 rounded-md flex items-center justify-between ${colorScheme}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ x: 3 }}
                            >
                              <div className="flex items-center">
                                {isExceeded && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                                <div>
                                  <p className="font-medium text-slate-800">{client.name}</p>
                                  <div className="flex items-center">
                                    <p className="text-sm">
                                      <span className={`font-medium ${textColor}`}>
                                        {sessionCount}/{packageLimit} sessions ({formattedPercentage}%)
                                      </span>
                                    </p>
                                    <Badge className={`ml-2 ${badgeClass}`}>
                                      {statusText}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline" 
                                  onClick={() => router.push(`/attendance?clientId=${client.id}`)}
                                  className="text-xs"
                                >
                                  Take Attendance
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline" 
                                  onClick={() => router.push(`/clients`)}
                                  className="text-xs"
                                >
                                  View
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()} 
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <motion.button 
                  onClick={() => router.push('/attendance')}
                  className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Take Attendance
                </motion.button>
                <motion.button 
                  onClick={() => router.push('/clients')}
                  className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  Manage Clients
                </motion.button>
                <motion.button 
                  onClick={() => router.push('/schedule')}
                  className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Manage Schedule
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Export with authentication protection
export default withAuth(Dashboard);

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import withAuth from "@/lib/firebase/with-auth";
import { useAuth } from "@/lib/firebase/auth-context";
import { getSessions, type Session } from "@/lib/session-service";
import { getAuth, signOut } from "firebase/auth";
import { motion } from "framer-motion";

// Dashboard component with animations
function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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

        {/* Second column - quick access */}
        <motion.div
          variants={itemVariants}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
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

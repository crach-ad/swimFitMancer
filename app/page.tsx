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

// Dashboard metrics card component removed

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/auth/login");
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user?.displayName || "Swimmer"}!</p>
        </div>

        <div className="flex items-center space-x-4">
          <button 
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
                  // Redirect anyway in case of error
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
          </button>
        </div>
      </div>

      {/* Stats section removed as requested */}

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First column - schedule summary */}
        <Card className="lg:col-span-2">
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
                sessions.map((session) => {
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
                    <div key={session.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <div>
                        <p className="font-medium text-slate-800">{session.name}</p>
                        <p className="text-sm text-slate-500">
                          {dateDisplay}, {timeDisplay} · {session.location}
                        </p>
                      </div>
                      <div className="text-sm font-medium px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                        {session.maxAttendees ? `${session.maxAttendees} max` : 'Open'}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show message if no upcoming sessions
                <div className="text-center p-4 text-slate-500">
                  No upcoming classes scheduled.
                </div>
              )}
              <div className="mt-4">
                <button onClick={() => router.push('/schedule')} className="text-sm text-sky-600 hover:text-sky-800 font-medium">
                  View full schedule →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second column - quick access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/attendance')}
                className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
              >
                Take Attendance
              </button>
              <button 
                onClick={() => router.push('/clients')}
                className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
              >
                Manage Clients
              </button>
              <button 
                onClick={() => router.push('/schedule')}
                className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center justify-center font-medium"
              >
                Manage Schedule
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export with authentication protection
export default withAuth(Dashboard);


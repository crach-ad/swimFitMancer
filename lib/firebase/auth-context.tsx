import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChange, getCurrentUser } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    
    // Function to set up authentication monitoring
    const setupAuth = async () => {
      try {
        console.log('Setting up auth monitoring...');
        
        // Subscribe to auth state changes first to catch all events
        unsubscribeAuth = onAuthStateChange((currentUser) => {
          console.log('Auth state changed:', currentUser ? 'User authenticated' : 'No user');
          setUser(currentUser);
          setLoading(false);
        });
        
        // Mark auth as initialized
        setAuthInitialized(true);
      } catch (error) {
        console.error('Error setting up auth monitoring:', error);
        setLoading(false);
      }
    };
    
    // Initialize auth immediately
    setupAuth();
    
    // Cleanup function
    return () => {
      if (unsubscribeAuth) {
        console.log('Cleaning up auth subscription');
        unsubscribeAuth();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

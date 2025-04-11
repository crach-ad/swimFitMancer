"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./firebase/auth-context";

// Higher-order component to ensure only authenticated users can access protected routes
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication state is loaded and user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show loading state or render the protected content
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render the children if the user is authenticated
  return user ? <>{children}</> : null;
}

// Optional higher-order component approach (for pages that need to be fully wrapped)
export default function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function WithAuth(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

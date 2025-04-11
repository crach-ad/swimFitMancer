// Higher-order component for route protection
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

// Simple spinner component for loading states
function Spinner({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid border-t-transparent border-blue-600 ${sizeClasses[size]}`}
    />
  );
}

// This HOC wraps protected pages to ensure only authenticated users can access them
export default function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithAuth(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If auth state is loaded and user is not authenticated, redirect to login
      if (!loading && !user) {
        router.push("/auth/login");
      }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      );
    }

    // If user is authenticated, render the protected component
    if (user) {
      return <Component {...props} />;
    }

    // This should not be visible since we redirect on !user
    return null;
  };
}

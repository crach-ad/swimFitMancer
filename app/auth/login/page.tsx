"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { onAuthStateChange } from "@/lib/firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/firebase/auth";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastUser, setLastUser] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // Check if user has previously logged in
  useEffect(() => {
    // Try to get last logged in user from localStorage
    const storedUser = localStorage.getItem('lastLoginUser');
    if (storedUser) {
      try {
        setLastUser(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    // Also check if there's an active session
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is already signed in, redirect to dashboard
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await signIn(email, password);
      // Store user display name for future logins
      if (user.displayName) {
        localStorage.setItem('lastLoginUser', user.displayName);
      }
      
      toast({
        title: "Success",
        description: "You have successfully logged in!",
        variant: "default",
      });
      router.push("/"); // Navigate to dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <Image
              src="/images/swimfit-logo.png"
              alt="SwimFit Logo"
              width={280}
              height={120}
              priority
              className="mb-6"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-sky-100">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              {lastUser ? `Welcome Back, ${lastUser}` : 'Welcome Back'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-sky-600 hover:text-sky-800 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{" "}
              <a href="/auth/signup" className="text-sky-600 hover:text-sky-800 font-medium transition-colors">
                Sign up
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Program highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 w-full max-w-md grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-100 p-4">
          <h3 className="font-medium text-sky-700">Muscle Aerobics</h3>
          <p className="text-sm text-gray-600 mt-1">Build strength with water-based fitness.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-100 p-4">
          <h3 className="font-medium text-sky-700">Learn to Swim</h3>
          <p className="text-sm text-gray-600 mt-1">Master swimming with expert instructors.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-100 p-4">
          <h3 className="font-medium text-sky-700">Stroke Development</h3>
          <p className="text-sm text-gray-600 mt-1">Refine your technique and efficiency.</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-gray-500"
      >
        © {new Date().getFullYear()} SwimFit. All rights reserved.
      </motion.p>
    </div>
  );
}

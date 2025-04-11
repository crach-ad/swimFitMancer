"use client";

export default function LoginPage() {
  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-700">SwimFit</h1>
          <p className="text-gray-600 mt-1">Welcome Back</p>
        </div>

        <form>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button 
              type="button" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded transition-colors mt-2"
            >
              Login
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4 text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-cyan-600 hover:underline font-semibold">
            Sign up
          </a>
        </div>
      </div>

      {/* Simple Program Highlights */}
      <div className="mt-8 w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold text-center text-cyan-800">Our Programs</h3>
        
        <div className="bg-white p-3 rounded shadow-sm border border-cyan-100">
          <h4 className="font-medium text-cyan-700">Muscle Aerobics</h4>
          <p className="text-sm text-gray-600 mt-1">Build strength with water-based fitness.</p>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm border border-cyan-100">
          <h4 className="font-medium text-cyan-700">Learn to Swim</h4>
          <p className="text-sm text-gray-600 mt-1">Master swimming fundamentals with expert instructors.</p>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm border border-cyan-100">
          <h4 className="font-medium text-cyan-700">Stroke Development</h4>
          <p className="text-sm text-gray-600 mt-1">Refine your technique and efficiency.</p>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-xs text-gray-500 pb-4">
        © {new Date().getFullYear()} SwimFit. All rights reserved.
      </footer>
    </div>
  );
}

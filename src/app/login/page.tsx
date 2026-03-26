"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during Google authentication.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans">
      
      {/* Left Panel - Branding / Hero */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 opacity-90 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>

        <div className="relative z-10 max-w-lg p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Capstone</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
              Final Year Research
            </span><br />
            Progress.
          </h1>
          <p className="text-lg text-blue-100/80 mb-10 leading-relaxed font-light">
            An advanced, premium workspace designed specifically for tracking exploits, analyzing small language models, and organizing critical payloads.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-white/70">
            <div className="h-px bg-white/20 flex-1"></div>
            Secure & Encrypted Database
            <div className="h-px bg-white/20 flex-1"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50 dark:bg-slate-950 relative">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile Only Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Capstone</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Welcome to Capstone
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in with your Google account to access your workspace securely.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
               {error}
            </div>
          )}

          <div className="space-y-5">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.74 22.37 10.05H12V14.22H17.92C17.65 15.58 16.89 16.73 15.73 17.51V20.21H19.29C21.37 18.29 22.56 15.52 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.3 20.21L15.74 17.51C14.75 18.17 13.48 18.57 12 18.57C9.13 18.57 6.69 16.63 5.82 14.04H2.15V16.89C3.96 20.49 7.68 23 12 23Z" fill="#34A853"/>
                  <path d="M5.82 14.04C5.59 13.38 5.46 12.7 5.46 12C5.46 11.3 5.6 10.62 5.82 9.96V7.12H2.15C1.41 8.6 1 10.25 1 12C1 13.75 1.41 15.4 2.15 16.89L5.82 14.04Z" fill="#FBBC05"/>
                  <path d="M12 5.43C13.62 5.43 15.06 5.99 16.21 7.08L19.38 3.9C17.45 2.1 14.96 1 12 1C7.68 1 3.96 3.51 2.15 7.12L5.82 9.96C6.69 7.37 9.13 5.43 12 5.43Z" fill="#EA4335"/>
                </svg>
              )}
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

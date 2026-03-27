"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Code, FileText, LayoutDashboard, LogOut, Award, GraduationCap, User } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Daily Progress", href: "/progress", icon: BarChart3 },
    { name: "Thesis", href: "/thesis", icon: GraduationCap },
    { name: "Resources", href: "/resources", icon: FileText },
    { name: "Coding Stuff", href: "/coding", icon: Code },
    { name: "Personal Outcomes", href: "/outcomes", icon: Award },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 transition-colors">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Capstone
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        {user && (
          <div className="px-3 py-2 flex items-center gap-3">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.displayName || "Researcher"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeSwitcher />
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

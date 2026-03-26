"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Code, FileText, LayoutDashboard, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Daily Progress", href: "/progress", icon: BarChart3 },
    { name: "Resources", href: "/resources", icon: FileText },
    { name: "Coding Stuff", href: "/coding", icon: Code },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-white border-r border-slate-200 shadow-sm sticky top-0">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          ResearchTracker
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
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          <Settings className="h-5 w-5 text-slate-400" />
          Settings
        </div>
      </div>
    </div>
  );
}

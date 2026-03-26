"use client";

import { useState } from "react";
import { Menu, X, Bell, LayoutDashboard, BarChart3, FileText, Code } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Daily Progress", href: "/progress", icon: BarChart3 },
    { name: "Resources", href: "/resources", icon: FileText },
    { name: "Coding Stuff", href: "/coding", icon: Code },
  ];

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white border-b border-slate-200 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            ResearchTracker
          </span>
        </div>
        <div className="flex items-center">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white pt-16 h-screen w-full">
          <nav className="flex flex-col p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium scale-[1.02]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-base">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}

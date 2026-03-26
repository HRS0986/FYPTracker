"use client";

import { Activity, BookOpen, Clock, Code } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

interface Log {
  id: string;
  date: string;
  progress: string;
  nextSteps: string;
}

interface Resource {
  id: string;
  title: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  const [totalSnippets, setTotalSnippets] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch total logs
    const qLogs = query(collection(db, "progress_logs"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setTotalLogs(snapshot.size);
      
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Log[];
      
      setLogs(fetchedLogs.slice(0, 3)); // Only keep 3 recent for UI
    });

    // Fetch total resources
    const qRes = query(collection(db, "resources"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubRes = onSnapshot(qRes, (snapshot) => {
      setTotalResources(snapshot.size);
      
      const fetchedRes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      
      setResources(fetchedRes.slice(0, 3)); // Only keep 3 recent for UI
    });

    // Fetch total coding
    const qCode = query(collection(db, "coding_stuff"), where("userId", "==", user.uid));
    const unsubCode = onSnapshot(qCode, (snapshot) => {
      setTotalSnippets(snapshot.size);
    });

    return () => {
      unsubLogs();
      unsubRes();
      unsubCode();
    };
  }, [user]);

  const statCards = [
    { name: "Progress Logs", value: totalLogs.toString(), icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-200 dark:border-blue-800" },
    { name: "Research Papers", value: totalResources.toString(), icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/50", border: "border-indigo-200 dark:border-indigo-800" },
    { name: "Code Snippets", value: totalSnippets.toString(), icon: Code, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/50", border: "border-emerald-200 dark:border-emerald-800" },
    { name: "Focus Hours", value: "24", icon: Clock, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-200 dark:border-purple-800", isMock: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Welcome back!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Here is an overview of your prompt injection research.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.border} border transition-colors`}>
              <stat.icon className={`h-6 w-6 ${stat.color} transition-colors`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{stat.name}</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors tracking-tight">
                {stat.value}
                {stat.isMock && <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">(est)</span>}
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Progress */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 transition-colors">Recent Progress</h3>
            <Link href="/progress" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {logs.length === 0 ? (
               <div className="flex items-center justify-center p-8 text-slate-400 text-sm">No recent logs</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-4 items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">{log.date}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 transition-colors whitespace-pre-wrap">{log.progress}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          {/* Incoming Next Steps */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 transition-colors">Next Steps Required</h3>
            </div>
            <div className="space-y-4">
              {logs.filter(l => l.nextSteps).slice(0, 3).length === 0 ? (
                 <div className="flex items-center justify-center p-8 text-slate-400 text-sm">No incoming next steps</div>
              ) : (
                logs.filter(l => l.nextSteps).slice(0, 3).map((log, i) => (
                  <label key={i} className="flex gap-3 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                    <input type="checkbox" className="mt-1 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {log.nextSteps}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <h3 className="font-bold text-lg mb-2 relative z-10">Capture Exploit Vectors</h3>
             <p className="text-indigo-100 text-sm mb-4 relative z-10">Found a new prompt jailbreak? Save the snippet to test locally.</p>
             <Link href="/coding" className="inline-flex bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors relative z-10">
               Add Snippet →
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

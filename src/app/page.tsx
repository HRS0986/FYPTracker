"use client";

import { Activity, BookOpen, Code, GraduationCap, Award, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

interface Log {
  id: string;
  date: string;
  progress: string;
  nextSteps: string;
}


interface Outcome {
  id: string;
  title: string;
  type: string;
  date: string;
}

interface Chapter {
  id: string;
  title: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  const [totalSnippets, setTotalSnippets] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [totalOutcomes, setTotalOutcomes] = useState(0);

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

    const qRes = query(collection(db, "resources"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubRes = onSnapshot(qRes, (snapshot) => {
      setTotalResources(snapshot.size);
    });

    const qCode = query(collection(db, "coding_stuff"), where("userId", "==", user.uid));
    const unsubCode = onSnapshot(qCode, (snapshot) => {
      setTotalSnippets(snapshot.size);
    });

    // Fetch total thesis chapters
    const qThesis = query(collection(db, "thesis_chapters"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubThesis = onSnapshot(qThesis, (snapshot) => {
      setTotalChapters(snapshot.size);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chapter[];
      setChapters(fetched.slice(0, 3));
    });

    // Fetch total outcomes
    const qOutcomes = query(collection(db, "outcomes"), where("userId", "==", user.uid), orderBy("date", "desc"));
    const unsubOutcomes = onSnapshot(qOutcomes, (snapshot) => {
      setTotalOutcomes(snapshot.size);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Outcome[];
      setOutcomes(fetched.slice(0, 3));
    });

    return () => {
      unsubLogs();
      unsubRes();
      unsubCode();
      unsubThesis();
      unsubOutcomes();
    };
  }, [user]);

  const statCards = [
    { name: "Progress Logs", value: totalLogs.toString(), icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-200 dark:border-blue-800" },
    { name: "Thesis chapters", value: totalChapters.toString(), icon: GraduationCap, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/50", border: "border-indigo-200 dark:border-indigo-800" },
    { name: "Personal Outcomes", value: totalOutcomes.toString(), icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/50", border: "border-amber-200 dark:border-amber-800" },
    { name: "Resources", value: totalResources.toString(), icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/50", border: "border-emerald-200 dark:border-emerald-800" },
    { name: "Coding Stuff", value: totalSnippets.toString(), icon: Code, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-200 dark:border-purple-800" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Welcome back!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Here is an overview of your final year research.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className={`p-3 rounded-2xl shrink-0 ${stat.bg} ${stat.border} border transition-colors`}>
              <stat.icon className={`h-5 w-5 ${stat.color} transition-colors`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors truncate">{stat.name}</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors tracking-tight">
                {stat.value}
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
                 <div className="flex items-center justify-center p-8 text-slate-400 text-sm italic">No pending tasks found.</div>
              ) : (
                logs.filter(l => l.nextSteps).slice(0, 3).map((log, i) => (
                  <label key={i} className="flex gap-3 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors line-clamp-2">
                      {log.nextSteps}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats: Thesis & Outcomes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
               <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                 <GraduationCap className="w-4 h-4 text-indigo-500" />
                 Chapters
               </h4>
               <div className="space-y-2">
                 {chapters.length === 0 ? (
                   <p className="text-xs text-slate-400">Chapters not started yet.</p>
                 ) : (
                   chapters.map(c => (
                     <div key={c.id} className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 border-l-2 border-indigo-500/20 pl-2">
                       {c.title}
                     </div>
                   ))
                 )}
               </div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
               <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                 <Award className="w-4 h-4 text-amber-500" />
                 Recent Outcomes
               </h4>
               <div className="space-y-2">
                 {outcomes.length === 0 ? (
                   <p className="text-xs text-slate-400">No outcomes recorded.</p>
                 ) : (
                   outcomes.map(o => (
                     <div key={o.id} className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 border-l-2 border-amber-500/20 pl-2">
                       {o.title}
                     </div>
                   ))
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

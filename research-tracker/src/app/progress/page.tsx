"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

interface Log {
  id: string;
  date: string;
  progress: string;
  nextSteps: string;
  blockers: string;
  createdAt: any;
}

export default function DailyProgress() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [progressText, setProgressText] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [blockers, setBlockers] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "progress_logs"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Log[];
      
      setLogs(fetchedLogs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching logs: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !progressText.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, "progress_logs"), {
        userId: user.uid,
        date,
        progress: progressText,
        nextSteps,
        blockers: blockers || "None",
        createdAt: serverTimestamp()
      });

      // Reset form
      setProgressText("");
      setNextSteps("");
      setBlockers("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving log: ", error);
      alert("Failed to save log. Please ensure your Firebase credentials are valid.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Daily Progress</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track what you did, what to do next, and any blockers.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Log"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors">New Progress Log</h2>
          <form className="space-y-4" onSubmit={handleSaveLog}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-all color-scheme-dark"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Today's Progress</label>
              <textarea
                rows={3}
                required
                value={progressText}
                onChange={(e) => setProgressText(e.target.value)}
                placeholder="What did you accomplish today?"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-shadow resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Next Steps</label>
              <textarea
                rows={2}
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="What are you planning to do tomorrow?"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-shadow resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Blockers (if any)</label>
              <textarea
                rows={2}
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Any issues preventing progress?"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-shadow resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Log"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors text-slate-500 dark:text-slate-400">
          No records yet. Click 'Add Log' to create your first entry.
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 group-[.is-active]:bg-blue-600 dark:group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <time className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors">{log.date}</time>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">Progress</h4>
                    <p className="text-slate-800 dark:text-slate-200 text-sm transition-colors whitespace-pre-wrap">{log.progress}</p>
                  </div>
                  {log.nextSteps && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">Next Steps</h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors whitespace-pre-wrap">{log.nextSteps}</p>
                    </div>
                  )}
                  {log.blockers && log.blockers !== "None" && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 mt-2 flex gap-2 transition-colors">
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">{log.blockers}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

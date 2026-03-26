"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, Loader2, Pencil, Trash2, Settings, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface Log {
  id: string;
  date: string;
  progress: string;
  nextSteps: string;
  blockers: string;
  timeSpent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}

export default function DailyProgress() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [progressText, setProgressText] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [blockers, setBlockers] = useState("");
  const [timeSpent, setTimeSpent] = useState("00:00");

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

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setProgressText("");
    setNextSteps("");
    setBlockers("");
    setTimeSpent("00:00");
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (log: Log) => {
    setEditingId(log.id);
    setDate(log.date);
    setProgressText(log.progress);
    setNextSteps(log.nextSteps);
    setBlockers(log.blockers === "None" ? "" : log.blockers);
    setTimeSpent(log.timeSpent || "00:00");
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log?")) return;
    try {
      await deleteDoc(doc(db, "progress_logs", id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !progressText.trim()) return;

    setIsSaving(true);
    try {
      const logData = {
        date,
        progress: progressText,
        nextSteps,
        blockers: blockers || "None",
        timeSpent,
      };

      if (editingId) {
        await updateDoc(doc(db, "progress_logs", editingId), logData);
      } else {
        await addDoc(collection(db, "progress_logs"), {
          ...logData,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving log: ", error);
      alert("Failed to save log.");
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
          onClick={() => {
            if (isFormOpen) resetForm();
            else setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Log"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors">
            {editingId ? "Edit Progress Log" : "New Progress Log"}
          </h2>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Time Spent (HH:MM) *</label>
                <input
                  type="text"
                  required
                  value={timeSpent}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 4) val = val.slice(0, 4);
                    if (val.length > 2) val = val.slice(0, 2) + ":" + val.slice(2);
                    setTimeSpent(val);
                  }}
                  placeholder="00:00"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Today&apos;s Progress</label>
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
                {isSaving ? "Saving..." : editingId ? "Update Log" : "Save Log"}
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
          No records yet. Click &apos;Add Log&apos; to create your first entry.
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
                  <div className="relative z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === log.id ? null : log.id);
                      }} 
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Settings"
                    >
                      <Settings className={`h-4 w-4 transition-transform duration-300 ${activeMenuId === log.id ? "rotate-90" : ""}`} />
                    </button>
                    
                    {activeMenuId === log.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={() => handleEdit(log)} 
                          className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(log.id)} 
                          className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5" />
                   <span>{log.timeSpent || "00:00"} Spent</span>
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

"use client";

import { useState, useEffect } from "react";
import { Plus, Award, Lightbulb, PenTool, ExternalLink, Loader2, Trash2, Cpu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface Outcome {
  id: string;
  title: string;
  type: string;
  description: string;
  url?: string;
  date: string;
  createdAt: any;
}

export default function Outcomes() {
  const { user } = useAuth();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("knowledge");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "outcomes"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Outcome[];
      
      setOutcomes(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching outcomes: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, "outcomes"), {
        userId: user.uid,
        title,
        type,
        description,
        url,
        date,
        createdAt: serverTimestamp()
      });

      // Reset form
      setTitle("");
      setType("knowledge");
      setDescription("");
      setUrl("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving outcome: ", error);
      alert("Failed to save outcome.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "outcomes", id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const getIcon = (itemType: string) => {
    switch (itemType) {
      case "article":
        return <PenTool className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case "tool":
        return <Cpu className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case "knowledge":
      default:
        return <Lightbulb className="h-6 w-6 text-amber-500 dark:text-amber-400" />;
    }
  };

  const getBadgeStyle = (itemType: string) => {
    switch (itemType) {
      case "article":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "tool":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "knowledge":
      default:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors flex items-center gap-2">
            <Award className="w-7 h-7 text-yellow-500" />
            Outcomes & Achievements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Track published articles, newly gained knowledge, and tools you've successfully built.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Log New Achievement"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 transition-colors">Add New Outcome</h2>
          <form className="space-y-5" onSubmit={handleSaveOutcome}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Published Medium Article on Llama-3 Bypassing"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-shadow"
                  >
                    <option value="knowledge">Knowledge Gained</option>
                    <option value="article">Written Article</option>
                    <option value="tool">Tool / Prototype Built</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-shadow color-scheme-dark"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Description / Summary *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What exactly did you achieve or learn?"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow resize-y"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Link / Evidence (Optional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://medium.com/..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSaving ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
        </div>
      ) : outcomes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center transition-colors">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No achievements logged yet.</h3>
          <p className="text-slate-500 dark:text-slate-400">Click the button above to start tracking your knowledge and milestones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outcomes.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full hover:shadow-md dark:hover:shadow-slate-800/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/20 rounded-bl-full -z-10 transition-colors"></div>
              
              <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10" title="Delete Outcome">
                 <Trash2 className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl border ${getBadgeStyle(item.type)} transition-colors`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(item.type)} transition-colors`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-6 transition-colors whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
              
              {item.url && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Associated Link
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

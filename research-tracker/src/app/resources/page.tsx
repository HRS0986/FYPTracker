"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Plus, BookOpen, Video, Globe, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  notes: string;
  createdAt: any;
}

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("paper");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "resources"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      
      setResources(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching resources: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, "resources"), {
        userId: user.uid,
        title,
        type,
        url,
        notes,
        createdAt: serverTimestamp()
      });

      setTitle("");
      setType("paper");
      setUrl("");
      setNotes("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving resource: ", error);
      alert("Failed to save resource.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const getIcon = (itemType: string) => {
    switch (itemType) {
      case "paper":
        return <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "video":
        return <Video className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "article":
      default:
        return <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Research Resources</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage papers, articles, and useful links for Prompt Injection.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Resource"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors">Add New Resource</h2>
          <form className="space-y-4" onSubmit={handleSaveResource}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Universal and Transferable Adversarial Attacks..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-shadow"
                >
                  <option value="paper">Research Paper</option>
                  <option value="article">Article / Blog</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">URL / Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why is this important?"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Resource"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors text-slate-500 dark:text-slate-400">
          No records yet. Click 'Add Resource' to create your first entry.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-full hover:shadow-md dark:hover:shadow-slate-800/50 transition-all group relative">
              
              <button onClick={() => handleDelete(resource.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10" title="Delete Resource">
                 <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                  {getIcon(resource.type)}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors mr-6">
                  {resource.type}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-2">
                {resource.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-4 transition-colors whitespace-pre-wrap">
                {resource.notes}
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Resource
                  </a>
                ) : (
                  <span className="text-sm text-slate-400 italic">No URL provided</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

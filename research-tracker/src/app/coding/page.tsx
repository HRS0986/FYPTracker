"use client";

import { useState, useEffect } from "react";
import { Plus, Code2, GitBranch, Bug, Copy, Check, Loader2, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface CodingItem {
  id: string;
  title: string;
  type: string;
  content: string;
  url?: string;
  createdAt: any;
}

export default function CodingStuff() {
  const { user } = useAuth();
  const [items, setItems] = useState<CodingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("snippet");
  const [content, setContent] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "coding_stuff"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CodingItem[];
      
      setItems(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching coding items: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      // If type is not snippet, content field serves as URL optionally, or just note. 
      // User can input URL directly in content.
      const isUrl = content.startsWith("http");
      
      await addDoc(collection(db, "coding_stuff"), {
        userId: user.uid,
        title,
        type,
        content,
        url: isUrl && type !== "snippet" ? content : "",
        createdAt: serverTimestamp()
      });

      setTitle("");
      setType("snippet");
      setContent("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving coding item: ", error);
      alert("Failed to save snippet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteDoc(doc(db, "coding_stuff", id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const getIcon = (itemType: string) => {
    switch (itemType) {
      case "repo":
        return <GitBranch className="h-5 w-5 text-slate-700 dark:text-slate-400" />;
      case "issue":
        return <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "snippet":
      default:
        return <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Coding Stuff</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Snippets, GitHub Repos, and implementation notes.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Item"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 transition-colors">Add New Code Item</h2>
          <form className="space-y-4" onSubmit={handleSaveItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Llama-3 evaluation script"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-shadow"
                >
                  <option value="snippet">Code Snippet</option>
                  <option value="repo">GitHub Repository</option>
                  <option value="issue">Bug / Issue</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                {type === "snippet" ? "Code Block *" : "URL / Description *"}
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={type === "snippet" ? "Paste code snippet here..." : "Paste URL or write link details..."}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow resize-y font-mono text-sm"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors text-slate-500 dark:text-slate-400">
          No records yet. Click 'Add Item' to create your first snippet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-full hover:shadow-md dark:hover:shadow-slate-800/50 transition-all group relative">
              
              <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10" title="Delete Item">
                 <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between mb-4 pr-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                    {getIcon(item.type)}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug transition-colors pr-2">{item.title}</h3>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors whitespace-nowrap">
                  {item.type}
                </span>
              </div>

              {item.type === "snippet" ? (
                <div className="relative flex-1 group/code">
                  <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(item.id, item.content)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md shadow-sm transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <pre className="bg-slate-900 dark:bg-slate-950 text-slate-50 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed h-full border dark:border-slate-800">
                    <code>{item.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 transition-colors whitespace-pre-wrap">{item.content}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {item.url}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

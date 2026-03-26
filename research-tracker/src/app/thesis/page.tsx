"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, GraduationCap, Edit2, Trash2, Loader2, Save, X, BookOpen, FileText } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Chapter {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function Thesis() {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill-new"), { ssr: false }), []);
  
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "thesis_chapters"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chapter[];
      
      setChapters(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching chapters: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing
        await updateDoc(doc(db, "thesis_chapters", editingId), {
          title,
          content,
          updatedAt: serverTimestamp()
        });
      } else {
        // Add new
        await addDoc(collection(db, "thesis_chapters"), {
          userId: user.uid,
          title,
          content,
          createdAt: serverTimestamp()
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving chapter: ", error);
      alert("Failed to save chapter.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (chapter: Chapter) => {
    setTitle(chapter.title);
    setContent(chapter.content);
    setEditingId(chapter.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await deleteDoc(doc(db, "thesis_chapters", id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Thesis Writing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Structure your research into chapters and draft your content.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            New Chapter
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
              {editingId ? "Edit Chapter" : "Create New Chapter"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
               <X className="w-6 h-6" />
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSaveChapter}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Chapter Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Introduction"
                className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Chapter Content / Outline *</label>
              <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <ReactQuill 
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="Start writing your research content here..."
                  className="thesis-editor dark:text-slate-100 min-h-[350px]"
                />
              </div>
            </div>

            <style jsx global>{`
              .thesis-editor .ql-toolbar {
                border: none !important;
                border-bottom: 1px solid #e2e8f0 !important;
                background: #f8fafc !important;
              }
              .dark .thesis-editor .ql-toolbar {
                background: #0f172a !important;
                border-bottom: 1px solid #1e293b !important;
              }
              .thesis-editor .ql-container {
                border: none !important;
                font-family: inherit !important;
                font-size: 1rem !important;
              }
              .dark .thesis-editor .ql-toolbar .ql-stroke {
                stroke: #94a3b8 !important;
              }
              .dark .thesis-editor .ql-toolbar .ql-fill {
                fill: #94a3b8 !important;
              }
              .dark .thesis-editor .ql-toolbar .ql-picker {
                color: #94a3b8 !important;
              }
            `}</style>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? "Saving..." : editingId ? "Update Chapter" : "Save Chapter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : chapters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 p-20 text-center transition-colors">
          <BookOpen className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your thesis is a blank canvas.</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">Start by adding your first chapter to organize your research findings.</p>
          <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
              <Plus className="w-5 h-5" />
              Add Introduction Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
                      {chapter.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(chapter)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(chapter.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 prose-sm sm:prose-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

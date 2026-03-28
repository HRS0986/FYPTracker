"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, Loader2, Code2, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

export default function SnippetDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "coding_stuff", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching snippet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  const copyToClipboard = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <p className="text-slate-500 text-lg font-medium">Snippet not found.</p>
        <button 
          onClick={() => router.push("/coding")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Coding Stuff
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-semibold group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-2">{item.title}</h1>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {item.type}
                </span>
                {item.createdAt && (
                   <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs uppercase tracking-wider">
                     <Clock className="w-3.5 h-3.5" />
                     {new Date(item.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                   </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 hover:shadow-xl"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-emerald-400" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy Full Code</>
            )}
          </button>
        </div>

        <div className="p-0 bg-slate-950 relative">
           <pre className="p-8 overflow-auto text-sm md:text-base font-mono leading-relaxed min-h-[600px] text-slate-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             <code 
               dangerouslySetInnerHTML={{ 
                 __html: highlight(item.content, languages.javascript, "javascript") 
               }} 
             />
           </pre>
        </div>
      </div>
    </div>
  );
}

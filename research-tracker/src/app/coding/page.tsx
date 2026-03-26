"use client";

import { useState } from "react";
import { Plus, Code2, GitBranch, Bug, Copy, Check } from "lucide-react";

export default function CodingStuff() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Evaluate Model Script",
      type: "snippet",
      language: "python",
      content: `from transformers import AutoModelForCausalLM, AutoTokenizer
model_name = "meta-llama/Meta-Llama-3-8B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)`,
    },
    {
      id: 2,
      title: "LangChain Exploit Test Repo",
      type: "repo",
      url: "https://github.com/example/langchain-exploit",
      content: "Reference repository for testing common bypass techniques.",
    },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "repo":
        return <GitBranch className="h-5 w-5 text-slate-700" />;
      case "issue":
        return <Bug className="h-5 w-5 text-red-600" />;
      case "snippet":
      default:
        return <Code2 className="h-5 w-5 text-blue-600" />;
    }
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coding Stuff</h1>
          <p className="text-slate-500 mt-1">Snippets, GitHub Repos, and implementation notes.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Item"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Code Item</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Llama-3 evaluation script"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-shadow bg-white">
                  <option value="snippet">Code Snippet</option>
                  <option value="repo">GitHub Repository</option>
                  <option value="issue">Bug / Issue</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content / URL / Code</label>
              <textarea
                rows={4}
                placeholder="Paste code snippet or write notes..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-shadow resize-y font-mono text-sm"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setIsFormOpen(false)}
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {getIcon(item.type)}
                </div>
                <h3 className="font-bold text-slate-900 leading-snug">{item.title}</h3>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                {item.type}
              </span>
            </div>

            {item.type === "snippet" ? (
              <div className="relative group flex-1">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(item.id, item.content)}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md shadow-sm transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed h-full">
                  <code>{item.content}</code>
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-4">{item.content}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center font-medium text-blue-600 hover:text-blue-700 hover:underline text-sm"
                  >
                    {item.url}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

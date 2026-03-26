"use client";

import { useState } from "react";
import { ExternalLink, FileText, Plus, BookOpen, Video, Globe } from "lucide-react";

export default function Resources() {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Jailbreaking Black Box Large Language Models in Twenty Queries",
      url: "https://arxiv.org/abs/2310.08419",
      type: "paper",
      notes: "Interesting approach to black box prompt injection.",
    },
    {
      id: 2,
      title: "Defending ChatGPT against Jailbreak Attack via Dan Prompts",
      url: "#",
      type: "article",
      notes: "Shows how to build a defense layer. Need to reimplement the defense for small LMs.",
    },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "paper":
        return <BookOpen className="h-5 w-5 text-indigo-600" />;
      case "video":
        return <Video className="h-5 w-5 text-red-600" />;
      case "article":
      default:
        return <Globe className="h-5 w-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Resources</h1>
          <p className="text-slate-500 mt-1">Manage papers, articles, and useful links for Prompt Injection.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close Form" : "Add Resource"}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Resource</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Universal and Transferable Adversarial Attacks..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-white">
                  <option value="paper">Research Paper</option>
                  <option value="article">Article / Blog</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Why is this important?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setIsFormOpen(false)}
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                {getIcon(resource.type)}
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                {resource.type}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
              {resource.title}
            </h3>
            <p className="text-sm text-slate-600 flex-1 mb-4">
              {resource.notes}
            </p>
            <div className="pt-4 border-t border-slate-100 mt-auto">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open Resource
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function DailyProgress() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      date: "2026-03-26",
      progress: "Evaluated Llama-3-8B against common prompt injection datasets.",
      nextSteps: "Analyze the accuracy and false-positive rates.",
      blockers: "Compute resources are limited for larger continuous runs.",
    },
    {
      id: 2,
      date: "2026-03-25",
      progress: "Set up the testing environment and downloaded models via HuggingFace.",
      nextSteps: "Write the evaluation scripts using Python and LangChain.",
      blockers: "None",
    },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Progress</h1>
          <p className="text-slate-500 mt-1">Track what you did, what to do next, and any blockers.</p>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">New Progress Log</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Today's Progress</label>
              <textarea
                rows={3}
                placeholder="What did you accomplish today?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Steps</label>
              <textarea
                rows={2}
                placeholder="What are you planning to do tomorrow?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blockers (if any)</label>
              <textarea
                rows={2}
                placeholder="Any issues preventing progress?"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 outline-none transition-shadow resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setIsFormOpen(false)}
              >
                Save Log
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {logs.map((log) => (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <time className="text-sm font-medium text-blue-600">{log.date}</time>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Progress</h4>
                  <p className="text-slate-800 text-sm">{log.progress}</p>
                </div>
                {log.nextSteps && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Next Steps</h4>
                    <p className="text-slate-700 text-sm">{log.nextSteps}</p>
                  </div>
                )}
                {log.blockers && log.blockers !== "None" && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2 flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{log.blockers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { BarChart3, Clock, Code, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { label: "Daily Logs", value: "12", icon: BarChart3, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { label: "Resources", value: "34", icon: FileText, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
    { label: "Code Snippets", value: "8", icon: Code, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Tracking research: Prompt Injection detection using Small Language Models
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/progress"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Log
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Daily Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 transition-colors">
              <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              Recent Progress
            </h2>
            <Link href="/progress" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            <div className="border-l-2 border-blue-500 dark:border-blue-400 pl-4 py-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Today</p>
              <p className="text-sm text-slate-800 dark:text-slate-200 transition-colors">Evaluated Llama-3-8B against common prompt injection datasets.</p>
            </div>
            <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Yesterday</p>
              <p className="text-sm text-slate-800 dark:text-slate-200 transition-colors">Set up the testing environment and downloaded models via HuggingFace.</p>
            </div>
          </div>
        </div>

        {/* Recent Resources */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 transition-colors">
              <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              Latest Resources
            </h2>
            <Link href="/resources" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-colors">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Jailbreaking Black Box Large Language Models in Twenty Queries</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">arXiv:2310.08419</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-colors">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Defending ChatGPT against Jailbreak Attack via Dan Prompts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Research Paper</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

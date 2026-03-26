import { BarChart3, Clock, Code, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { label: "Daily Logs", value: "12", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Resources", value: "34", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Code Snippets", value: "8", icon: Code, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Tracking research: Prompt Injection detection using Small Language Models
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/progress"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Daily Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Recent Progress
            </h2>
            <Link href="/progress" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            <div className="border-l-2 border-blue-500 pl-4 py-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Today</p>
              <p className="text-sm text-slate-800">Evaluated Llama-3-8B against common prompt injection datasets.</p>
            </div>
            <div className="border-l-2 border-slate-200 pl-4 py-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Yesterday</p>
              <p className="text-sm text-slate-800">Set up the testing environment and downloaded models via HuggingFace.</p>
            </div>
          </div>
        </div>

        {/* Recent Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Latest Resources
            </h2>
            <Link href="/resources" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-900">Jailbreaking Black Box Large Language Models in Twenty Queries</p>
              <p className="text-xs text-slate-500 mt-1">arXiv:2310.08419</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-900">Defending ChatGPT against Jailbreak Attack via Dan Prompts</p>
              <p className="text-xs text-slate-500 mt-1">Research Paper</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

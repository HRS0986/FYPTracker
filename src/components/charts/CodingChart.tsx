"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { subDays, subMonths, isAfter, parseISO, format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronDown, Code2 } from "lucide-react";

export default function CodingChart() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [range, setRange] = useState("week"); // week, month, all
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "coding_stuff"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toISOString()?.split("T")[0] || ""
      }));
      setData(fetched);
    });

    return () => unsubscribe();
  }, [user]);

  const chartData = useMemo(() => {
    let startDate: Date | null = null;
    if (range === "week") startDate = subDays(new Date(), 7);
    else if (range === "month") startDate = subMonths(new Date(), 1);

    const filtered = data.filter(item => {
      if (!item.date) return false;
      return !startDate || isAfter(parseISO(item.date), startDate);
    });

    // Group by date
    const groups: Record<string, any> = {};
    filtered.forEach(item => {
      const d = format(parseISO(item.date), "MMM dd");
      if (!groups[d]) {
        groups[d] = { date: d, snippet: 0, repo: 0, issue: 0, dataset: 0 };
      }
      groups[d][item.type] = (groups[d][item.type] || 0) + 1;
    });

    return Object.values(groups);
  }, [data, range]);

  const colors: Record<string, string> = {
    snippet: "#3b82f6", // blue
    repo: "#334155", // slate-700
    issue: "#ef4444", // red
    dataset: "#10b981", // emerald
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Development Effort</h3>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Calendar className="w-4 h-4" />
            {range === "week" ? "Last Week" : range === "month" ? "Last Month" : "All Time"}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {["week", "month", "all"].map((r) => (
                <button
                  key={r}
                  onClick={() => { setRange(r); setIsOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${range === r ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                >
                  {r === "week" ? "Last Week" : r === "month" ? "Last Month" : "All Time"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: 'none', 
                borderRadius: '12px',
                color: '#f3f4f6' 
              }}
              labelStyle={{ color: '#9ca3af', marginBottom: '8px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
            />
            {Object.keys(colors).map(type => (
              <Bar 
                key={type}
                dataKey={type} 
                stackId="a" 
                fill={colors[type]} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
                animationDuration={1500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

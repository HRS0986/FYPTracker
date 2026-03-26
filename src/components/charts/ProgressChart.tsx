"use client";

import { useState, useEffect, useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { subDays, subMonths, isAfter, parseISO, format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronDown, Clock } from "lucide-react";

const parseTimeSpent = (time: string) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h * 60) + (m || 0);
};

export default function ProgressChart() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [range, setRange] = useState("week"); // week, month, all
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "progress_logs"),
      where("userId", "==", user.uid),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(fetched);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredData = useMemo(() => {
    let startDate: Date | null = null;
    if (range === "week") startDate = subDays(new Date(), 7);
    else if (range === "month") startDate = subMonths(new Date(), 1);

    return data
      .filter(item => !startDate || isAfter(parseISO(item.date), startDate))
      .map(item => ({
        date: format(parseISO(item.date), "MMM dd"),
        minutes: parseTimeSpent(item.timeSpent),
        fullDate: item.date
      }));
  }, [data, range]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Research Time</h3>
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
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${range === r ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
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
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              unit="m"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '12px',
                color: '#f8fafc' 
              }}
              itemStyle={{ color: '#60a5fa' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMin)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

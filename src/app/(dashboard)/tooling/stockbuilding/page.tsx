'use client';
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Layers, Users, CheckCircle, ChevronRight } from "lucide-react";

export default function StockBuildingDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stock_building_jobs"), (snapshot) => {
      const jobsArr = [];
      snapshot.forEach(doc => jobsArr.push({ id: doc.id, ...doc.data() }));
      setJobs(jobsArr);
    });
    return () => unsubscribe();
  }, []);

  // Summary stats
  const stats = {
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === "In Progress").length,
    completed: jobs.filter(j => j.status === "Completed").length,
    teamLeads: [...new Set(jobs.map(j => j.teamLead))].length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-white mb-8">Stock Building Dashboard</h1>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <StatsCard icon={<Layers className="w-7 h-7 text-green-400 mb-2" />} value={stats.total} label="Total Jobs" />
          <StatsCard icon={<ChevronRight className="w-7 h-7 text-yellow-300 mb-2" />} value={stats.inProgress} label="In Progress" />
          <StatsCard icon={<CheckCircle className="w-7 h-7 text-green-300 mb-2" />} value={stats.completed} label="Completed" />
          <StatsCard icon={<Users className="w-7 h-7 text-blue-300 mb-2" />} value={stats.teamLeads} label="Team Leads" />
        </div>
        {/* Main Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">All Jobs (Live)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead className="text-zinc-300 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 text-left">Order</th>
                  <th className="py-3 px-4 text-left">Mold</th>
                  <th className="py-3 px-4 text-left">Team Lead</th>
                  <th className="py-3 px-4 text-left">SQM Target</th>
                  <th className="py-3 px-4 text-left">SQM Done</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Updated At</th>
                  <th className="py-3 px-4 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b border-white/5 hover:bg-zinc-800/40 transition">
                    <td className="py-2 px-4">{job.orderId}</td>
                    <td className="py-2 px-4">{job.mold}</td>
                    <td className="py-2 px-4">{job.teamLead}</td>
                    <td className="py-2 px-4">{job.sqmTarget}</td>
                    <td className="py-2 px-4">{job.sqmDone}</td>
                    <td className={`py-2 px-4 font-bold ${
                      job.status === "Completed"
                        ? "text-green-300"
                        : job.status === "In Progress"
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}>
                      {job.status}
                    </td>
                    <td className="py-2 px-4">
                      {job.updatedAt?.seconds
                        ? new Date(job.updatedAt.seconds * 1000).toLocaleString()
                        : ""}
                    </td>
                    <td className="py-2 px-4">{job.remarks}</td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-zinc-400 py-8">No jobs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="bg-zinc-800 border border-white/10 rounded-xl p-5 flex flex-col items-center shadow-md">
      {icon}
      <div className="text-2xl font-bold text-white">{value}</div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

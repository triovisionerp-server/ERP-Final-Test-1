'use client';
import React, { useState, useMemo } from "react";
import { Box, Edit2, CheckCircle, Save, Users, Layers, Clock } from 'lucide-react';

// Simulate logged-in supervisor
const CURRENT_SUPERVISOR_ID = 101;
const CURRENT_SUPERVISOR_NAME = "Ajay"; 

// Sample jobs (replace with Firestore fetch in production)
const DEMO_JOBS = [
  {
    id: 1,
    orderId: "SB-001",
    mold: "M32",
    teamLeadId: 101,
    teamLead: "Ajay",
    team: ["Bhanu", "Chitra"],
    sqmTarget: 20,
    sqmDone: 15,
    status: "In Progress",
    remarks: "PE foam ready",
    deadline: "2025-11-25"
  },
  {
    id: 2,
    orderId: "SB-002",
    mold: "M12",
    teamLeadId: 101,
    teamLead: "Ajay",
    team: ["Bhanu", "Ken"],
    sqmTarget: 18,
    sqmDone: 18,
    status: "Completed",
    remarks: "Excellent finish",
    deadline: "2025-11-20"
  },
  {
    id: 3,
    orderId: "SB-005",
    mold: "M18",
    teamLeadId: 102,
    teamLead: "Pavan",
    team: ["Sai", "Ravi"],
    sqmTarget: 10,
    sqmDone: 0,
    status: "Pending",
    remarks: "",
    deadline: "2025-11-30"
  }
];

export default function StockBuildingSupervisor() {
  // Only show jobs assigned to current supervisor
  const [jobs, setJobs] = useState(
    DEMO_JOBS.filter(job => job.teamLeadId === CURRENT_SUPERVISOR_ID)
  );
  const [editId, setEditId] = useState<number | null>(null);
  const [editVals, setEditVals] = useState({ sqmDone: '', remarks: '', status: '' });

  // Quick stats
  const stats = useMemo(() => ({
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === "In Progress").length,
    completed: jobs.filter(j => j.status === "Completed").length,
    today: jobs.filter(j => 
      j.status === "Completed" && 
      j.deadline === new Date().toISOString().split('T')[0]
    ).length
  }), [jobs]);

  function beginEdit(job: any) {
    setEditId(job.id);
    setEditVals({
      sqmDone: job.sqmDone.toString(),
      remarks: job.remarks || '',
      status: job.status
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditVals({ sqmDone: '', remarks: '', status: '' });
  }

  function saveEdit(job: any) {
    setJobs(jobs => jobs.map(j => (
      j.id === job.id
      ? {
          ...j,
          sqmDone: Number(editVals.sqmDone),
          remarks: editVals.remarks,
          status: editVals.status
        }
      : j
    )));
    setEditId(null);
    setEditVals({ sqmDone: '', remarks: '', status: '' });
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Subtle grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="relative z-10 px-6 py-8 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-10">
          <Layers className="w-10 h-10 text-green-300" />
          <h1 className="text-3xl font-bold text-white">Stock Building – Supervisor: {CURRENT_SUPERVISOR_NAME}</h1>
        </div>
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <StatsCard icon={<Box className="w-7 h-7 text-blue-300 mb-1" />} value={stats.total} label="Your Jobs" />
          <StatsCard icon={<Clock className="w-7 h-7 text-yellow-300 mb-1" />} value={stats.inProgress} label="In Progress" />
          <StatsCard icon={<CheckCircle className="w-7 h-7 text-green-300 mb-1" />} value={stats.completed} label="Completed" />
          <StatsCard icon={<Users className="w-7 h-7 text-purple-300 mb-1" />} value={stats.today} label="Done Today" />
        </div>
        {/* Jobs Table Editable */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Update Stock Building Jobs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-white">
              <thead className="text-zinc-300 border-b border-white/10">
                <tr>
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Mold</th>
                  <th className="py-3 pr-4">Target SQM</th>
                  <th className="py-3 pr-4">SQM Done</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Remarks</th>
                  <th className="py-3 pr-4">Deadline</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{job.orderId}</td>
                    <td className="py-2 pr-4">{job.mold}</td>
                    <td className="py-2 pr-4">{job.sqmTarget}</td>
                    <td className="py-2 pr-4">
                      {editId === job.id ? (
                        <input 
                          type="number" 
                          className="bg-zinc-900 border border-white/10 text-white px-2 py-1 rounded w-20"
                          value={editVals.sqmDone}
                          onChange={(e) => setEditVals(v => ({...v, sqmDone: e.target.value}))}
                        />
                      ) : job.sqmDone }
                    </td>
                    <td className="py-2 pr-4">
                      {editId === job.id ? (
                        <select
                          className="bg-zinc-900 border border-white/10 text-white px-2 py-1 rounded"
                          value={editVals.status}
                          onChange={e => setEditVals(v => ({...v, status: e.target.value}))}
                        >
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Pending</option>
                        </select>
                      ) : (
                        <span className={
                          job.status === "Completed" ? "text-green-300 font-semibold" :
                          job.status === "In Progress" ? "text-yellow-300 font-semibold" :
                          "text-red-300 font-semibold"
                        }>{job.status}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {editId === job.id ? (
                        <input 
                          type="text" 
                          className="bg-zinc-900 border border-white/10 text-white px-2 py-1 rounded w-32"
                          value={editVals.remarks}
                          onChange={e => setEditVals(v => ({...v, remarks: e.target.value}))}
                        />
                      ) : job.remarks }
                    </td>
                    <td className="py-2 pr-4">{job.deadline}</td>
                    <td className="py-2 pr-4">
                      {editId === job.id ? (
                        <>
                          <button 
                            className="mr-2 text-green-300 hover:underline"
                            onClick={() => saveEdit(job)}
                          >
                            <Save className="inline mr-1 w-4 h-4" /> Save
                          </button>
                          <button 
                            className="text-zinc-400 hover:underline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          className="text-blue-300 hover:underline"
                          onClick={() => beginEdit(job)}
                        >
                          <Edit2 className="inline mr-1 w-4 h-4" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-zinc-400 text-center py-8">No assigned jobs.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single card for stats
function StatsCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center">
      {icon}
      <div className="text-2xl font-bold text-white">{value}</div>
      <span className="text-sm text-zinc-400">{label}</span>
    </div>
  );
}

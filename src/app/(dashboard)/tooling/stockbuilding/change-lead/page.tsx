'use client';
import React, { useState } from "react";

// This would be fetched from your DB:
const jobs = [{id:1, orderId:"SB-001", teamLead:"Ajay"}, {id:2, orderId:"SB-002", teamLead:"Pavan"}];
const teamLeads = ["Ajay", "Pavan", "Ken"];

export default function ChangeLead() {
  const [selectedJob, setSelectedJob] = useState(jobs[0].id);
  const [newLead, setNewLead] = useState(jobs[0].teamLead);

  function submitChange(e) {
    e.preventDefault();
    // Your DB/API call here!
    alert(`Changed lead for job ${selectedJob} to ${newLead}`);
  }

  return (
    <div className="max-w-lg mx-auto bg-white/5 border border-white/10 p-8 rounded-xl mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">Change Team Lead</h2>
      <form onSubmit={submitChange} className="flex flex-col gap-4">
        <select value={selectedJob} onChange={e => setSelectedJob(Number(e.target.value))} className="px-2 py-2 rounded bg-zinc-900 text-white border border-white/10">
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.orderId} (Current: {job.teamLead})</option>
          ))}
        </select>
        <select value={newLead} onChange={e => setNewLead(e.target.value)} className="px-2 py-2 rounded bg-zinc-900 text-white border border-white/10">
          {teamLeads.map(lead => (
            <option key={lead}>{lead}</option>
          ))}
        </select>
        <button type="submit" className="bg-yellow-700 hover:bg-yellow-800 rounded py-2 mt-2 font-medium text-white">
          Change Team Lead
        </button>
      </form>
    </div>
  );
}

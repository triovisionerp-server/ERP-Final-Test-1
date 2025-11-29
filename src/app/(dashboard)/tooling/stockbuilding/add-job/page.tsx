'use client';
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, SquarePlus, Loader2, Send } from "lucide-react";

export default function AddJobPage() {
  const [form, setForm] = useState({
    orderId: "",
    mold: "",
    teamLead: "",
    sqmTarget: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [lastTask, setLastTask] = useState<any | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      const docRef = await addDoc(collection(db, "stock_building_jobs"), {
        orderId: form.orderId,
        mold: form.mold,
        teamLead: form.teamLead,
        sqmTarget: Number(form.sqmTarget),
        sqmDone: 0,
        status: "In Progress",
        remarks: form.remarks,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setSuccess("Task assigned successfully!");
      setLastTask({...form, docId: docRef.id});
      setForm({
        orderId: "",
        mold: "",
        teamLead: "",
        sqmTarget: "",
        remarks: ""
      });
    } catch (err) {
      setSuccess("Error assigning job: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  }

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // WhatsApp share message
  const getWhatsappLink = (task: any) => {
    if (!task) return "#";
    const text = `
New Stock Building Task Assigned!

Order ID: ${task.orderId}
Mold: ${task.mold}
Team Lead: ${task.teamLead}
SQM Target: ${task.sqmTarget}
Remarks: ${task.remarks || "-"}
Status: In Progress

Please check your ERP dashboard for details.`.trim();
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Background gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <SquarePlus className="w-7 h-7 text-green-300" /> Assign New Task
        </h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Order ID" value={form.orderId} onChange={v => setField("orderId", v)} required />
          <Input label="Mold" value={form.mold} onChange={v => setField("mold", v)} required />
          <Input label="Team Lead" value={form.teamLead} onChange={v => setField("teamLead", v)} required icon={<Users className="w-5 h-5 text-blue-300" />} />
          <Input label="SQM Target" value={form.sqmTarget} onChange={v => setField("sqmTarget", v)} type="number" required />
          <Input label="Remarks" value={form.remarks} onChange={v => setField("remarks", v)} />
          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-green-700 via-blue-700 to-green-800 text-white font-bold py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition-all hover:brightness-110"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SquarePlus className="w-5 h-5" />}
            Assign Task
          </button>
        </form>
        {success && (
          <div className="text-center mt-6 text-green-400 font-semibold flex flex-col items-center gap-3">
            {success}
            {lastTask && (
              <a
                href={getWhatsappLink(lastTask)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-white bg-green-600 px-4 py-2 rounded-full transition hover:bg-green-700 font-medium"
              >
                <Send className="w-4 h-4" /> Notify on WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom input (restyled for match)
function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-white mb-3">
      <span className="block mb-1 text-zinc-300">{label} {required && <span className="text-red-400">*</span>}</span>
      <div className="flex items-center gap-2">
        {icon}
        <input
          type={type}
          className="bg-zinc-800 border border-white/20 rounded-lg py-2 px-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
        />
      </div>
    </label>
  );
}

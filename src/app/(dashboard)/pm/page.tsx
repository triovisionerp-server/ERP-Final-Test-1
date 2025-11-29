'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx'; 
import { 
  LogOut, UploadCloud, Package, CheckCircle, XCircle, UserPlus, Plus,
  FileSpreadsheet, Bell, Trash2, AlertCircle, ChevronRight, Layers 
} from 'lucide-react';

// ... (Keep Departments/Supervisors Arrays same as before) ...
const DEPARTMENTS: Record<string, string[]> = {
  'Stock Building': ['Base Making', 'Stock Cutting', 'Stock Bonding', 'Curing'],
  'Machining': ['CNC Roughing', 'Manual Finishing', 'Drilling'],
  'Lamination': ['Gelcoat Application', 'Fiber Layup', 'Infusion Process', 'Demolding'],
  'Assembly': ['Bonding', 'Hardware Install', 'Final Fitment'],
  'Quality': ['Dimensional Check', 'Visual Inspection', 'CMM']
};

const SUPERVISORS = [
  { name: 'Rajesh Kumar', role: 'Stock Lead', dept: 'Stock Building' },
  { name: 'Amit Singh', role: 'Machining Lead', dept: 'Machining' },
  { name: 'Sarah Jenkins', role: 'Lamination Lead', dept: 'Lamination' },
  { name: 'Mike Ross', role: 'Assembly Lead', dept: 'Assembly' },
];

export default function ProjectManagerDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [boms, setBoms] = useState<any[]>([]);
  const [selectedBOM, setSelectedBOM] = useState<any>(null); 
  const [showCreateModal, setShowCreateModal] = useState(false); // <--- NEW MODAL STATE
  
  // Assignment Form
  const [assignForm, setAssignForm] = useState({ dept: 'Stock Building', supervisor: '', task: 'Base Making', allocationSQM: 0 });
  
  // New Project Form (Manual Entry)
  const [newProjectForm, setNewProjectForm] = useState({ code: '', name: '', client: '', molds: 1, sqm: 10 });

  useEffect(() => {
    const savedBoms = localStorage.getItem('boms');
    if (savedBoms) { try { setBoms(JSON.parse(savedBoms)); } catch(e) {} }
  }, []);

  // --- MANUAL CREATE ---
  const handleCreateManual = () => {
    if(!newProjectForm.code || !newProjectForm.name) return alert("Fill required fields");
    
    const newProject = {
        id: Date.now(),
        projectCode: newProjectForm.code,
        projectDescription: newProjectForm.name,
        customer: newProjectForm.client,
        moldSeries: '32', // Default
        totalMolds: newProjectForm.molds,
        targetPartsCompletion: 50,
        sqmPerPart: newProjectForm.sqm,
        status: 'Pending',
        createdDate: new Date().toISOString(),
        materials: { resinType: 'Standard', gelcoatPerMold: (newProjectForm.sqm * 0.6).toFixed(1) }
    };

    const updated = [newProject, ...boms];
    setBoms(updated);
    localStorage.setItem('boms', JSON.stringify(updated));
    setShowCreateModal(false);
    alert("Project Created!");
  };

  // ... (Keep existing handleAssign, handleFileUpload, deleteProject functions exactly as before) ...
  // Re-paste them if you lost them, otherwise just add the new modal below.

  // --- ASSIGNMENT LOGIC ---
  const handleAssign = () => {
    if(!selectedBOM || !assignForm.supervisor) return;
    const newTask = {
        id: Date.now(),
        projectId: selectedBOM.projectCode,
        projectName: selectedBOM.projectDescription,
        department: assignForm.dept,
        operation: assignForm.task,
        assignedTo: assignForm.supervisor,
        targetSQM: assignForm.allocationSQM > 0 ? assignForm.allocationSQM : selectedBOM.sqmPerPart,
        completedSQM: 0,
        status: 'Pending',
        createdDate: new Date().toISOString(),
    };
    const toolingJobs = JSON.parse(localStorage.getItem('tooling_jobs') || "[]");
    localStorage.setItem('tooling_jobs', JSON.stringify([...toolingJobs, newTask]));
    const updatedBoms = boms.map(b => b.id === selectedBOM.id ? { ...b, status: 'In Progress' } : b);
    localStorage.setItem('boms', JSON.stringify(updatedBoms));
    setBoms(updatedBoms);
    alert(`Task Assigned to ${assignForm.supervisor}`);
    setSelectedBOM(null);
  };

  // --- EXCEL UPLOAD ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      const newProjects = data.map((row: any) => ({
        id: Date.now() + Math.random(),
        projectCode: row['Code'] || 'PRJ-X',
        projectDescription: row['Description'] || 'Imported Project',
        customer: row['Customer'] || 'General',
        moldSeries: row['Series'] || '32',
        totalMolds: parseInt(row['Molds']) || 1,
        targetPartsCompletion: parseInt(row['Target']) || 50,
        sqmPerPart: parseFloat(row['SQM']) || 10,
        status: 'Pending',
      }));
      const updated = [...newProjects, ...boms];
      setBoms(updated);
      localStorage.setItem('boms', JSON.stringify(updated));
    };
    reader.readAsBinaryString(file);
  };

  const deleteProject = (id: number) => {
     const updated = boms.filter(b => b.id !== id);
     setBoms(updated);
     localStorage.setItem('boms', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-light text-white tracking-tight">Project Manager</h1>
           <p className="text-zinc-400 mt-1">Work Breakdown & Assignment</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-bold">
           PM Access
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex gap-4">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-lg transition-all">
                <Plus className="w-5 h-5" /> New Project
            </button>
            <div className="relative">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold shadow-lg transition-all">
                    <UploadCloud className="w-5 h-5" /> Import Excel
                </button>
            </div>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {boms.map((bom) => (
            <motion.div key={bom.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group relative">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-bold">{bom.projectCode}</span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-bold">{bom.customer}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{bom.projectDescription}</h3>
                        <div className="grid grid-cols-3 gap-6 mt-4 text-sm text-zinc-400">
                            <div>Area: <strong className="text-white">{bom.sqmPerPart || 0} SQM</strong></div>
                            <div>Molds: <strong className="text-white">{bom.totalMolds}</strong></div>
                            <div>Status: <strong className="text-yellow-400">{bom.status}</strong></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button onClick={() => setSelectedBOM(bom)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Assign Work</button>
                        <button onClick={() => deleteProject(bom.id)} className="p-3 text-zinc-500 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      {/* MANUAL CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                        <button onClick={() => setShowCreateModal(false)}><XCircle className="w-8 h-8 text-zinc-500 hover:text-white"/></button>
                    </div>
                    <div className="space-y-4">
                        <input className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Project Code (e.g., HULL-01)" onChange={e => setNewProjectForm({...newProjectForm, code: e.target.value})} />
                        <input className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Project Name" onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} />
                        <input className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Client Name" onChange={e => setNewProjectForm({...newProjectForm, client: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Molds" onChange={e => setNewProjectForm({...newProjectForm, molds: parseInt(e.target.value)})} />
                            <input type="number" className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Area (SQM)" onChange={e => setNewProjectForm({...newProjectForm, sqm: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <button onClick={handleCreateManual} className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Save Project
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* (Keep the Assignment Modal code here - Same as before) */}
      {/* ... ASSIGNMENT MODAL ... */}
      <AnimatePresence>
        {selectedBOM && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div><h2 className="text-2xl font-bold">Assign Task</h2><p className="text-zinc-400 text-sm">{selectedBOM.projectDescription}</p></div>
                        <button onClick={() => setSelectedBOM(null)}><XCircle className="w-8 h-8 text-zinc-500 hover:text-white"/></button>
                    </div>
                    <div className="space-y-4">
                        <div><label className="text-xs text-zinc-500 uppercase font-bold">Department</label><select className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none mt-1" value={assignForm.dept} onChange={e => setAssignForm({...assignForm, dept: e.target.value})}>{Object.keys(DEPARTMENTS).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                        <div><label className="text-xs text-zinc-500 uppercase font-bold">Operation</label><select className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none mt-1" value={assignForm.task} onChange={e => setAssignForm({...assignForm, task: e.target.value})}>{DEPARTMENTS[assignForm.dept].map(op => <option key={op} value={op}>{op}</option>)}</select></div>
                        <div><label className="text-xs text-zinc-500 uppercase font-bold">Supervisor</label><select className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none mt-1" value={assignForm.supervisor} onChange={e => setAssignForm({...assignForm, supervisor: e.target.value})}>{SUPERVISORS.filter(s => s.dept === assignForm.dept).map(s => (<option key={s.name} value={s.name}>{s.name} (Lead)</option>))}</select></div>
                        <div><label className="text-xs text-zinc-500 uppercase font-bold">Target Area (SQM)</label><input type="number" className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-white outline-none mt-1" placeholder={`Max: ${selectedBOM.sqmPerPart || 0}`} onChange={e => setAssignForm({...assignForm, allocationSQM: parseFloat(e.target.value)})} /></div>
                    </div>
                    <button onClick={handleAssign} className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2"><UserPlus className="w-5 h-5" /> Confirm Assignment</button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
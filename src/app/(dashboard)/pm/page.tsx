'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx'; 
import { 
  LogOut, UploadCloud, Package, FileSpreadsheet, 
  Search, Filter, ExternalLink, MoreHorizontal, Plus 
} from 'lucide-react';

export default function PMMasterList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load all projects from "Server" (LocalStorage)
    const data = JSON.parse(localStorage.getItem('boms') || "[]");
    setProjects(data);
  }, []);

  // --- EXCEL IMPORT ENGINE ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      
      // Auto-Generate EBOM from Excel Data
      const newEntries = data.map((row: any) => ({
        id: Date.now() + Math.random(),
        projectCode: row['Code'] || `PRJ-${Math.floor(Math.random()*1000)}`,
        customer: row['Customer'] || 'New Client',
        description: row['Description'] || 'Imported Hull',
        sqm: parseFloat(row['SQM']) || 10,
        status: 'Pending',
        progress: 0,
        // The Auto-Calculated EBOM
        ebom: {
            resin: (parseFloat(row['SQM']) * 1.5).toFixed(1), // 1.5kg/sqm norm
            gelcoat: (parseFloat(row['SQM']) * 0.6).toFixed(1),
            fiber: (parseFloat(row['SQM']) * 2.0).toFixed(1),
            manpower: Math.ceil(parseFloat(row['SQM']) / 5) // 1 man per 5 sqm
        },
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
      }));
      
      const updated = [...newEntries, ...projects];
      setProjects(updated);
      localStorage.setItem('boms', JSON.stringify(updated));
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
         <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
               <FileSpreadsheet className="w-8 h-8 text-green-400" /> 
               Master Project Server
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Central Database of All Active Jobs</p>
         </div>
         
         <div className="flex gap-3">
            <div className="relative">
               <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
               <input 
                 placeholder="Search Code / Client..." 
                 className="pl-10 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-blue-500 w-64"
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-900/20">
               <UploadCloud className="w-4 h-4" /> Import
            </button>
            
            <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20"><Filter className="w-5 h-5" /></button>
         </div>
      </div>

      {/* THE DATA GRID (Excel Style) */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[600px]">
         <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-zinc-400 uppercase font-bold text-xs">
               <tr>
                  <th className="p-5 border-b border-white/10">Code</th>
                  <th className="p-5 border-b border-white/10">Client</th>
                  <th className="p-5 border-b border-white/10 w-1/3">Project Description</th>
                  <th className="p-5 border-b border-white/10 text-center">Est. Resin</th>
                  <th className="p-5 border-b border-white/10 text-center">Progress</th>
                  <th className="p-5 border-b border-white/10 text-center">Status</th>
                  <th className="p-5 border-b border-white/10 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {projects.filter(p => 
                  (p.projectCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (p.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
               ).map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-5 font-mono text-blue-300 font-bold">{row.projectCode}</td>
                     <td className="p-5 font-bold text-white">{row.customer}</td>
                     <td className="p-5 text-zinc-400">{row.projectDescription}</td>
                     <td className="p-5 text-center font-mono">{row.ebom?.resin || 0} kg</td>
                     <td className="p-5 text-center">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                           <div className={`h-full rounded-full ${row.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${row.progress}%`}}></div>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">{row.progress}%</span>
                     </td>
                     <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                           row.status === 'Completed' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                           'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                        }`}>
                           {row.status}
                        </span>
                     </td>
                     <td className="p-5 text-right">
                        <button 
                            onClick={() => window.open(`/pm/project/${row.id}`, '_blank')}
                            className="flex items-center gap-2 ml-auto text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all"
                        >
                            Manage <ExternalLink className="w-3 h-3" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {projects.length === 0 && (
            <div className="text-center py-32 text-zinc-500">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Server Empty. Import an Excel file to initialize DB.</p>
            </div>
         )}
      </div>

    </div>
  );
}
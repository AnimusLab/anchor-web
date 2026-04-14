import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function Profile() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ 
    projects: 0, 
    audits: 0, 
    team: 0, 
    score: 98 
  });

  return (
    <div className="min-h-screen bg-[#08080D] text-slate-200 font-mono p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        
        {/* --- PREMIUM PROFILE HEADER (Social-First) --- */}
        <div className="relative bg-[#0D0D14] border border-[#1E293B] overflow-hidden group shadow-2xl rounded-2xl p-8 mb-8 backdrop-blur-xl bg-opacity-80">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
             <div className="text-4xl">⚓</div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Glass Avatar Container */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-cyan-500/30 p-1 bg-gradient-to-tr from-cyan-500/20 to-transparent">
                 <div className="w-full h-full rounded-full bg-[#1A1A24] flex items-center justify-center text-4xl shadow-inner">
                   {user?.display_name?.charAt(0) || 'U'}
                 </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#0D0D14] animate-pulse"></div>
            </div>

            {/* Identity Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{user?.display_name}</h1>
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-widest">
                  {user?.role || 'Manager'}
                </span>
              </div>
              <p className="text-slate-500 text-xs mb-4">{user?.email}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <div className="text-center px-4 border-r border-[#1E293B]">
                    <div className="text-lg font-bold text-white">{stats.projects}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Projects</div>
                 </div>
                 <div className="text-center px-4 border-r border-[#1E293B]">
                    <div className="text-lg font-bold text-white">{stats.audits}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Audits</div>
                 </div>
                 <div className="text-center px-4">
                    <div className="text-lg font-bold text-emerald-400">{stats.score}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Integrity</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- IDENTITY MESH CARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-[#0D0D14] border border-[#1E293B] p-6 rounded-xl hover:border-cyan-500/30 transition-all">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sovereign Mesh ID</h3>
              <div className="bg-black/40 border border-[#1E293B] p-4 rounded-lg flex items-center justify-between">
                <code className="text-cyan-400 text-sm tracking-widest">{user?.org_id || 'MESH-ROOT-001'}</code>
                <span className="text-[10px] text-emerald-500 font-bold">VERIFIED</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-4 leading-relaxed uppercase">
                THIS IDENTITY IS CRYPTOGRAPHICALLY PINNED TO THE ANCHOR MASTER NODE. ALL ACTIONS ARE SIGNED VIA THE MESH RELAY.
              </p>
           </div>

           <div className="bg-[#0D0D14] border border-[#1E293B] p-6 rounded-xl hover:border-amber-500/30 transition-all">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">2FA Security</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-xl">📱</div>
                   <div>
                     <div className="text-xs text-white font-bold uppercase tracking-wider">Google Authenticator</div>
                     <div className="text-[10px] text-amber-500 uppercase tracking-widest">Active & Shielded</div>
                   </div>
                 </div>
                 <button className="text-[9px] border border-[#1E293B] px-3 py-1 text-slate-500 hover:text-white transition-all uppercase">Rotate</button>
              </div>
           </div>
        </div>

        {/* --- COMMAND CENTER (Actions) --- */}
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6">Management Command Center</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { title: 'Provision Project', icon: '🏗️', color: 'border-cyan-500/50', desc: 'Deploy new fleet node' },
             { title: 'Invite Lead', icon: '👤', color: 'border-emerald-500/50', desc: 'Onboard project manager' },
             { title: 'Audit Logs', icon: '📝', color: 'border-amber-500/50', desc: 'Full mesh provenance' },
             { title: 'Org Settings', icon: '⚙️', color: 'border-slate-500/50', desc: 'Hierarchy config' }
           ].map((action, i) => (
             <button key={i} className={`group bg-[#0D0D14] border p-6 rounded-xl transition-all hover:scale-[1.02] text-left relative overflow-hidden ${action.color}`}>
                <div className="text-2xl mb-4 group-hover:animate-bounce">{action.icon}</div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">{action.title}</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest leading-normal">{action.desc}</div>
                <div className="absolute -bottom-2 -right-2 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">{action.icon}</div>
             </button>
           ))}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function ProvisioningPortal() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('AUDITOR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form States
  const [auditorData, setAuditorData] = useState({
    display_name: '', email: '', regulator: 'SEC', department: '', jurisdiction: 'USA'
  });
  const [enterpriseData, setEnterpriseData] = useState({
    display_name: '', email: '', company_name: '', region: 'India', department: ''
  });

  const handleProvision = async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      const payload = type === 'AUDITOR' ? auditorData : enterpriseData;
      const endpoint = type === 'AUDITOR' ? '/api/auth/admin/provision/auditor' : '/api/auth/admin/provision/enterprise';
      
      const res = await fetch(`${endpoints.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMessage({ type: 'SUCCESS', text: `Handshake Dispatched: ${type} credentials sent to ${payload.email}` });
      } else {
        const err = await res.json();
        setMessage({ type: 'ERROR', text: err.detail || 'Provisioning Failed' });
      }
    } catch (e) {
      setMessage({ type: 'ERROR', text: 'Network Error: Check Connection' });
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-[#030305] p-10 flex flex-col gap-8 overflow-y-auto">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-[#F0F6FC]">Provisioning_Nexus // GATEKEEPER</h2>
        <p className="text-[11px] text-[#8B949E] font-mono opacity-60">Manual authorization and credential dispatch for the global compliance grid.</p>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="flex gap-1 border-b border-[#161B22]">
        <button 
          onClick={() => setActiveTab('AUDITOR')}
          className={`px-8 py-3 text-[10px] tracking-[0.2em] font-bold transition-all ${activeTab === 'AUDITOR' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-[#484F58] hover:text-[#8B949E]'}`}
        >
          REGULATORY_OFFICIALS
        </button>
        <button 
          onClick={() => setActiveTab('ENTERPRISE')}
          className={`px-8 py-3 text-[10px] tracking-[0.2em] font-bold transition-all ${activeTab === 'ENTERPRISE' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-[#484F58] hover:text-[#8B949E]'}`}
        >
          ENTERPRISE_OWNERS
        </button>
      </div>

      <div className="flex-1 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- Form Section --- */}
        <div className="flex flex-col gap-6 p-8 border border-[#161B22] bg-[#0D1117]/50 backdrop-blur-sm relative group">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/30 group-hover:border-cyan-400 transition-colors" />
          
          <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-2">New Identity Metadata</h3>
          
          {activeTab === 'AUDITOR' ? (
            <div className="flex flex-col gap-4 text-[11px]">
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Official Full Name</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 transition-all font-mono"
                  placeholder="EX: JOHN DOE"
                  value={auditorData.display_name}
                  onChange={e => setAuditorData({...auditorData, display_name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Government Email</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 transition-all font-mono"
                  placeholder="name@regulator.gov"
                  value={auditorData.email}
                  onChange={e => setAuditorData({...auditorData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#484F58] uppercase tracking-tighter">Regulatory Body</label>
                  <select 
                    className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 appearance-none font-mono"
                    value={auditorData.regulator}
                    onChange={e => setAuditorData({...auditorData, regulator: e.target.value})}
                  >
                    <option>SEC</option><option>FCA</option><option>RBI</option><option>EU-AI</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#484F58] uppercase tracking-tighter">Jurisdiction</label>
                  <input 
                    className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                    placeholder="USA"
                    value={auditorData.jurisdiction}
                    onChange={e => setAuditorData({...auditorData, jurisdiction: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Department</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                  placeholder="Compliance Oversight"
                  value={auditorData.department}
                  onChange={e => setAuditorData({...auditorData, department: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-[11px]">
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Owner Full Name</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                  placeholder="EX: HARITHA DESAI"
                  value={enterpriseData.display_name}
                  onChange={e => setEnterpriseData({...enterpriseData, display_name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Corporate Email</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                  placeholder="owner@company.ai"
                  value={enterpriseData.email}
                  onChange={e => setEnterpriseData({...enterpriseData, email: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#484F58] uppercase tracking-tighter">Company Name</label>
                <input 
                  className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                  placeholder="EX: Global Bank A"
                  value={enterpriseData.company_name}
                  onChange={e => setEnterpriseData({...enterpriseData, company_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#484F58] uppercase tracking-tighter">Region</label>
                  <input 
                    className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                    placeholder="India"
                    value={enterpriseData.region}
                    onChange={e => setEnterpriseData({...enterpriseData, region: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#484F58] uppercase tracking-tighter">Department</label>
                  <input 
                    className="bg-[#030305] border border-[#161B22] p-3 text-cyan-400 outline-none focus:border-cyan-400/50 font-mono"
                    placeholder="AI Safety Branch"
                    value={enterpriseData.department}
                    onChange={e => setEnterpriseData({...enterpriseData, department: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            onClick={() => handleProvision(activeTab)}
            className="mt-4 bg-cyan-400 text-[#030305] py-4 text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-cyan-300 transition-all disabled:opacity-50"
          >
            {loading ? 'EXECUTING_HANDSHAKE...' : 'APPROVE & GRANT ACCESS'}
          </button>
        </div>

        {/* --- Guidance & Notification Section --- */}
        <div className="flex flex-col gap-6">
          <div className="p-6 border border-[#161B22] bg-[#0D1117]/30">
            <h4 className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase mb-4">Operational Protocol</h4>
            <ul className="text-[10px] text-[#8B949E] space-y-4 font-mono leading-relaxed">
              <li className="flex gap-3">
                <span className="text-cyan-900">[01]</span>
                <span>Submitting this form triggers a background credential generation sequence (ID + TOTP + Master Key).</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-900">[02]</span>
                <span>The system pulls the official's public key (if available) or embeds a secure TOTP setup QR directly into the welcome packet.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-900">[03]</span>
                <span>An automated transmission is dispatched via the Sovereign Gatekeeper (mail.py) to the provided address.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-900">[04]</span>
                <span>Access is logged in the Audit Ledger as a "PROVISION_EVENT" for Root Accountability.</span>
              </li>
            </ul>
          </div>

          {message && (
            <div className={`p-6 border ${message.type === 'SUCCESS' ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-red-500/30 bg-red-500/5 text-red-400'} animate-slide-up`}>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-2">SYSTEM_RESPONSE</div>
              <div className="text-[11px] font-mono leading-relaxed">{message.text}</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  Truck, 
  Search, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { User, HazardousWasteRequest } from '../types';
import { CHEMICAL_COMPATIBILITY_MATRIX } from '../mockData';

interface WasteTabProps {
  currentUser: User;
  wasteRequests: HazardousWasteRequest[];
  onAddWasteRequest: (request: HazardousWasteRequest, logDetails: string) => void;
  onUpdateWasteStatus: (requestId: string, status: 'pending_pickup' | 'in_transit' | 'disposed', logDetails: string) => void;
}

export default function WasteTab({
  currentUser,
  wasteRequests,
  onAddWasteRequest,
  onUpdateWasteStatus
}: WasteTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // New Request Form State
  const [chemicalDescription, setChemicalDescription] = useState('');
  const [volume, setVolume] = useState('5 Gallons');
  const [state, setState] = useState<'liquid' | 'solid' | 'gas'>('liquid');
  const [category, setCategory] = useState<'acid' | 'base' | 'solvent' | 'toxic' | 'radioactive' | 'reactive'>('solvent');

  // Interactive compatibility state
  const [compClassA, setCompClassA] = useState<string>('acid');
  const [compClassB, setCompClassB] = useState<string>('base');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemicalDescription.trim()) return;

    // Check if compatibility warning
    const incompatibilities = CHEMICAL_COMPATIBILITY_MATRIX[category] || [];
    const hasIncompatibilityWarning = incompatibilities.includes('solvent'); // simple check or similar
    
    const newRequest: HazardousWasteRequest = {
      id: `HW-2026-0${wasteRequests.length + 42}`,
      generatorName: currentUser.name,
      generatorId: currentUser.id,
      chemicalDescription,
      volume,
      state,
      category,
      compatibilityCheck: category === 'reactive' || category === 'acid' ? 'warning' : 'passed',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending_pickup',
      manifestNumber: `EPA-TX-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const actionText = `Logged a Hazardous Waste Pickup Request (${volume} of ${category}) with manifest ${newRequest.manifestNumber}.`;
    onAddWasteRequest(newRequest, actionText);

    // Reset Form
    setChemicalDescription('');
    setIsAdding(false);
  };

  const handleUpdateStatus = (request: HazardousWasteRequest) => {
    let nextStatus: 'pending_pickup' | 'in_transit' | 'disposed' = 'pending_pickup';
    if (request.status === 'pending_pickup') nextStatus = 'in_transit';
    else if (request.status === 'in_transit') nextStatus = 'disposed';

    const actionText = `Updated waste manifest ${request.manifestNumber} disposal status to ${nextStatus.toUpperCase().replace('_', ' ')}.`;
    onUpdateWasteStatus(request.id, nextStatus, actionText);
  };

  // Evaluate chemical compatibility check
  const evaluateCompatibility = () => {
    if (compClassA === compClassB) return { compatible: true, msg: 'Safe. Storing identical classes together is standard procedure.' };
    
    const incompatibilitiesA = CHEMICAL_COMPATIBILITY_MATRIX[compClassA] || [];
    const incompatibilitiesB = CHEMICAL_COMPATIBILITY_MATRIX[compClassB] || [];
    
    if (incompatibilitiesA.includes(compClassB) || incompatibilitiesB.includes(compClassA)) {
      return { 
        compatible: false, 
        msg: `DANGER! ${compClassA.toUpperCase()} and ${compClassB.toUpperCase()} are highly incompatible. Mixing or co-storing risks toxic off-gassing, extreme exothermic reactions, or structural container fires.` 
      };
    }
    return { compatible: true, msg: 'No chemical storage incompatibility rules violated. Ensure standard air isolation and double-containment secondary tubs.' };
  };

  const compatibilityResult = evaluateCompatibility();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns: Pickup Requests & Inventory */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <Trash2 className="text-yellow-500 h-4 w-4" />
              Hazardous Waste Pickup logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Tracking EPA regulatory compliance, generator manifests and disposal status chains.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Request Pickup
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-3.5">
          {wasteRequests.map((req) => {
            let statusColor = 'bg-slate-800 text-slate-400';
            let barWidth = 'w-1/3';
            if (req.status === 'pending_pickup') {
              statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              barWidth = 'w-1/3 bg-amber-500';
            } else if (req.status === 'in_transit') {
              statusColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
              barWidth = 'w-2/3 bg-indigo-500';
            } else if (req.status === 'disposed') {
              statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              barWidth = 'w-full bg-emerald-500';
            }

            return (
              <div key={req.id} className="p-4 bg-slate-800/15 border border-slate-800 rounded-xl text-left hover:border-slate-700/60 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{req.volume} {req.category.toUpperCase()}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                        {req.manifestNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Generator: {req.generatorName} • Date: {req.requestDate}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor}`}>
                    {req.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="py-3 text-xs">
                  <span className="text-slate-400 block font-semibold mb-1">Chemical Inventory:</span>
                  <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] leading-relaxed">
                    {req.chemicalDescription}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/50">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Logged</span>
                      <span>Transit</span>
                      <span>Disposed</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barWidth} transition-all duration-500`} />
                    </div>
                  </div>
                  
                  {req.status !== 'disposed' && (
                    <button 
                      onClick={() => handleUpdateStatus(req)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 border border-slate-700 shrink-0"
                    >
                      <Truck className="h-3 w-3" />
                      Next Stage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chemical Compatibility Tool OR Add Request Form */}
      <div className="space-y-6 lg:col-span-1">
        
        {isAdding ? (
          /* ADD REQUEST FORM */
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Request Disposal Pickup</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 text-xs">Cancel</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Chemical Content & Concentration</label>
                <textarea 
                  value={chemicalDescription}
                  onChange={(e) => setChemicalDescription(e.target.value)}
                  placeholder="e.g. Hydrochloric Acid 5%, Water 95%, Trace Chromium"
                  className="w-full h-20 bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-yellow-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Container Volume</label>
                  <input 
                    type="text" 
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Physical State</label>
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="liquid">Liquid</option>
                    <option value="solid">Solid</option>
                    <option value="gas">Gas / Aerosol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">DOT Primary Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="acid">Inorganic Acid</option>
                  <option value="base">Inorganic Base</option>
                  <option value="solvent">Halogenated Solvent</option>
                  <option value="toxic">Toxic / Poisons</option>
                  <option value="radioactive">Low-Level Radioactive</option>
                  <option value="reactive">Water-Reactive Compound</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold py-2.5 rounded-lg transition"
              >
                Log Manifest & Request
              </button>
            </form>
          </div>
        ) : (
          /* CHEMICAL COMPATIBILITY TOOL */
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-yellow-500 shrink-0" />
              Co-Storage Compatibility Matrix
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Before staging waste barrels in secondary bins, cross-examine compatibility classes to prevent severe incidents.
              </p>

              <div className="grid grid-cols-1 gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chemical Class A</label>
                  <select 
                    value={compClassA}
                    onChange={(e) => setCompClassA(e.target.value)}
                    className="w-full bg-slate-900 text-slate-200 text-xs rounded-md p-1.5 border border-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="acid">Inorganic Acid</option>
                    <option value="base">Inorganic Base</option>
                    <option value="solvent">Halogenated Solvent</option>
                    <option value="radioactive">Radioactive Waste</option>
                    <option value="reactive">Water-Reactive</option>
                    <option value="toxic">Toxics</option>
                  </select>
                </div>

                <div className="flex items-center justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-slate-600 rotate-90 sm:rotate-0" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chemical Class B</label>
                  <select 
                    value={compClassB}
                    onChange={(e) => setCompClassB(e.target.value)}
                    className="w-full bg-slate-900 text-slate-200 text-xs rounded-md p-1.5 border border-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="acid">Inorganic Acid</option>
                    <option value="base">Inorganic Base</option>
                    <option value="solvent">Halogenated Solvent</option>
                    <option value="radioactive">Radioactive Waste</option>
                    <option value="reactive">Water-Reactive</option>
                    <option value="toxic">Toxics</option>
                  </select>
                </div>
              </div>

              {/* Compatibility Result Block */}
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                compatibilityResult.compatible 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
              }`}>
                <span className="font-bold flex items-center gap-1.5">
                  {compatibilityResult.compatible ? (
                    <>
                      <ShieldCheck className="h-4 w-4 shrink-0" /> Compatible Co-Storage
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" /> Reactive Hazard Detected!
                    </>
                  )}
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {compatibilityResult.msg}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FileText className="h-4 w-4 text-yellow-500" /> EPA RCRA Manifests
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All hazardous waste leaving the facility must travel with an EPA-approved uniform hazardous waste manifest (Form 8700-22) for strict cradle-to-grave tracking.
          </p>
        </div>
      </div>

    </div>
  );
}

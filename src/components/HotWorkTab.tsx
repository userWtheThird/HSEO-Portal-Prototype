import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  ShieldAlert, 
  CheckSquare, 
  CheckCircle, 
  Plus, 
  X, 
  AlertTriangle, 
  Timer,
  Play,
  Square
} from 'lucide-react';
import { User, HotWorkPermit } from '../types';

interface HotWorkTabProps {
  currentUser: User;
  permits: HotWorkPermit[];
  onAddPermit: (permit: HotWorkPermit, logDetails: string) => void;
  onApprovePermit: (permitId: string, approvedBy: string, logDetails: string) => void;
  onUpdatePermitStatus: (permitId: string, status: 'active' | 'completed' | 'expired', logDetails: string) => void;
}

export default function HotWorkTab({
  currentUser,
  permits,
  onAddPermit,
  onApprovePermit,
  onUpdatePermitStatus
}: HotWorkTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(permits[0]?.id || null);

  // New Permit Form State
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [fireWatchName, setFireWatchName] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [gasTestDone, setGasTestDone] = useState(false);
  const [fireExtinguisherPresent, setFireExtinguisherPresent] = useState(false);
  const [sprinklerProtected, setSprinklerProtected] = useState(false);
  const [combustiblesRemoved, setCombustiblesRemoved] = useState(false);
  const [fireWatchAssigned, setFireWatchAssigned] = useState(false);

  // Active Firewatch Timer simulation
  const [activeTimerPermitId, setActiveTimerPermitId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerIntervalId, setTimerIntervalId] = useState<any>(null);

  const selectedPermit = permits.find(p => p.id === selectedPermitId);

  // Submit permit draft
  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim() || !fireWatchName.trim()) return;

    const newPermit: HotWorkPermit = {
      id: `HWP-2026-00${permits.length + 3}`,
      location,
      applicantName: currentUser.name,
      applicantId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      description,
      hazardControls: {
        gasTestDone,
        fireExtinguisherPresent,
        sprinklerProtected,
        combustiblesRemoved,
        fireWatchAssigned
      },
      status: 'draft',
      fireWatchName,
      durationHours,
      createdAt: new Date().toISOString()
    };

    const actionText = `Submitted Hot Work Permit request for "${location}" (Draft).`;
    onAddPermit(newPermit, actionText);

    // Reset Form
    setLocation('');
    setDescription('');
    setFireWatchName('');
    setGasTestDone(false);
    setFireExtinguisherPresent(false);
    setSprinklerProtected(false);
    setCombustiblesRemoved(false);
    setFireWatchAssigned(false);
    setIsCreating(false);
    setSelectedPermitId(newPermit.id);
  };

  // Approve a permit (HSE Supervisor role required)
  const handleApprove = (permit: HotWorkPermit) => {
    const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAuthorized) {
      alert(`Permit authorization denied. Your simulated role "${currentUser.title}" does not hold Hot Work Authorization sign-off clearance. Please switch simulation user to Sarah Jenkins (HSE Director) in the header to approve.`);
      return;
    }

    const actionText = `Authorized Hot Work Permit ${permit.id} for ${permit.location} (Status: APPROVED).`;
    onApprovePermit(permit.id, currentUser.name, actionText);
  };

  // Activate permit (operator begins welding)
  const handleActivate = (permit: HotWorkPermit) => {
    const actionText = `Commenced Hot Work session on Permit ${permit.id} at ${permit.location} (Status: ACTIVE).`;
    onUpdatePermitStatus(permit.id, 'active', actionText);
  };

  // Complete permit
  const handleComplete = (permit: HotWorkPermit) => {
    const actionText = `Signed off on final 30-minute cool-down check for Permit ${permit.id}. Job marked COMPLETED.`;
    onUpdatePermitStatus(permit.id, 'completed', actionText);
    if (activeTimerPermitId === permit.id) {
      handleStopTimer();
    }
  };

  // Interactive firewatch clock simulation
  const handleStartTimer = (permitId: string) => {
    setActiveTimerPermitId(permitId);
    setTimeLeft(30 * 60); // 30 minutes in seconds
    
    // Simulate active timer tick
    if (timerIntervalId) clearInterval(timerIntervalId);
    const intId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerIntervalId(intId);
  };

  const handleStopTimer = () => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setActiveTimerPermitId(null);
    setTimeLeft(null);
    setTimerIntervalId(null);
  };

  // Format timer
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Active & Past Permits */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
            <Flame className="text-rose-500 h-4 w-4 animate-pulse" />
            Permit Register
          </h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Request Permit
          </button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {permits.map((permit) => {
            const isSelected = permit.id === selectedPermitId;
            
            let statusColor = 'bg-slate-800 text-slate-400';
            if (permit.status === 'draft') statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
            else if (permit.status === 'approved') statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
            else if (permit.status === 'active') statusColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
            else if (permit.status === 'completed') statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';

            return (
              <div 
                key={permit.id}
                onClick={() => { setSelectedPermitId(permit.id); setIsCreating(false); }}
                className={`p-3.5 rounded-xl cursor-pointer transition border text-left ${
                  isSelected 
                    ? 'bg-rose-950/15 border-rose-500/60 shadow-md shadow-rose-950/5' 
                    : 'bg-slate-800/30 border-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{permit.location}</h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${statusColor}`}>
                    {permit.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
                  <span>ID: {permit.id}</span>
                  <span>•</span>
                  <span>Applicant: {permit.applicantName}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">{permit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Permit Detail or Create Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 min-h-[400px] flex flex-col justify-between">
        
        {isCreating ? (
          /* CREATE HOT WORK PERMIT FORM */
          <form onSubmit={handleSubmitPermit} className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">New Hot Work Permit Request</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define location, hazards and fire control watches for welding/torch operations.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Specific Location Area</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Boiler Room, West Roof Deck"
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Fire Watch Name</label>
                <input 
                  type="text" 
                  value={fireWatchName}
                  onChange={(e) => setFireWatchName(e.target.value)}
                  placeholder="e.g. Robert Vance (L2 Operator)"
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description of Work</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Brazing brass pipes or structural arc-welding"
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Permit Duration (Hours)</label>
                <select 
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={12}>12 Hours (Max Shift)</option>
                </select>
              </div>
            </div>

            {/* Fire Control Checkpoints */}
            <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-rose-500" />
                Required Pre-Work Controls (Mandatory)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-800/40 border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={gasTestDone}
                    onChange={(e) => setGasTestDone(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-slate-700 border-slate-600"
                  />
                  <span>Flammable Gas Test Completed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-800/40 border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={fireExtinguisherPresent}
                    onChange={(e) => setFireExtinguisherPresent(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-slate-700 border-slate-600"
                  />
                  <span>ABC Extinguisher / Hose Present</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-800/40 border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={sprinklerProtected}
                    onChange={(e) => setSprinklerProtected(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-slate-700 border-slate-600"
                  />
                  <span>Automatic Sprinklers Operational</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-800/40 border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={combustiblesRemoved}
                    onChange={(e) => setCombustiblesRemoved(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-slate-700 border-slate-600"
                  />
                  <span>Combustibles Swept within 35 ft</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-800/40 border border-slate-800 hover:border-slate-700 sm:col-span-2">
                  <input 
                    type="checkbox" 
                    checked={fireWatchAssigned}
                    onChange={(e) => setFireWatchAssigned(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 bg-slate-700 border-slate-600"
                  />
                  <span>Continuous 30-min Fire Watch Assigned Post-Work</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-5 py-2 rounded-lg transition"
              >
                Submit Permit Draft
              </button>
            </div>
          </form>
        ) : selectedPermit ? (
          /* VIEW PERMIT DETAILS & ACTIONS */
          <div className="flex flex-col h-full justify-between gap-6 text-left">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-200">{selectedPermit.location}</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
                      {selectedPermit.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Requested by: <strong className="text-slate-300">{selectedPermit.applicantName}</strong> on {selectedPermit.date}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Duration: {selectedPermit.durationHours} hrs</span>
                </div>
              </div>

              {/* Status workflow banner */}
              {selectedPermit.status === 'draft' && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Awaiting Supervisor Sign-Off</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      This permit requires review and sign-off from an authorized HSE Officer (Admin/Facilities).
                    </p>
                  </div>
                </div>
              )}

              {selectedPermit.status === 'approved' && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs flex items-start gap-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Permit Authorized & Cleared</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Work has been approved by <strong>{selectedPermit.approvedBy}</strong>. The technician may now click &apos;Commence Hot Work&apos; to trigger session timer.
                    </p>
                  </div>
                </div>
              )}

              {selectedPermit.status === 'active' && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-pulse">
                  <Timer className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <span className="font-bold">ACTIVE SPARKS IN PROGRESS</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Active sparks are being emitted at the location. Continuous fire watch personnel <strong>{selectedPermit.fireWatchName}</strong> must remain stationed with an active extinguisher.
                    </p>
                  </div>
                </div>
              )}

              {selectedPermit.status === 'completed' && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs flex items-start gap-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Permit Safely Completed</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      The job has concluded, and the mandatory post-work 30-minute cooling interval was monitored and verified.
                    </p>
                  </div>
                </div>
              )}

              {/* Description and Checks */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Scope of Hot Work</h4>
                <p className="text-xs text-slate-200 bg-slate-800/40 p-3 rounded-lg border border-slate-800/60 font-medium">
                  {selectedPermit.description}
                </p>
              </div>

              {/* Checklist review */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Permit Pre-Checks Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPermit.hazardControls.gasTestDone ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Gas Test Done: <strong className={selectedPermit.hazardControls.gasTestDone ? 'text-emerald-400' : 'text-slate-400'}>{selectedPermit.hazardControls.gasTestDone ? 'YES' : 'NO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPermit.hazardControls.fireExtinguisherPresent ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Extinguisher Staged: <strong className={selectedPermit.hazardControls.fireExtinguisherPresent ? 'text-emerald-400' : 'text-slate-400'}>{selectedPermit.hazardControls.fireExtinguisherPresent ? 'YES' : 'NO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPermit.hazardControls.sprinklerProtected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Sprinkler Active: <strong className={selectedPermit.hazardControls.sprinklerProtected ? 'text-emerald-400' : 'text-slate-400'}>{selectedPermit.hazardControls.sprinklerProtected ? 'YES' : 'NO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPermit.hazardControls.combustiblesRemoved ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Combustibles Removed: <strong className={selectedPermit.hazardControls.combustiblesRemoved ? 'text-emerald-400' : 'text-slate-400'}>{selectedPermit.hazardControls.combustiblesRemoved ? 'YES' : 'NO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 sm:col-span-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPermit.hazardControls.fireWatchAssigned ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Post-Work 30m Fire Watch: <strong className={selectedPermit.hazardControls.fireWatchAssigned ? 'text-emerald-400' : 'text-slate-400'}>Assigned to {selectedPermit.fireWatchName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Fire watch cool-down simulation zone */}
              {selectedPermit.status === 'active' && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400 animate-pulse">
                      <Timer className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Cool-Down Safety Clock</span>
                      <span className="text-[10px] text-slate-400">Time remaining for post-work smolder verification.</span>
                    </div>
                  </div>
                  
                  {activeTimerPermitId === selectedPermit.id ? (
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-mono font-bold text-rose-400 animate-pulse">{formatTime(timeLeft)}</span>
                      <button 
                        onClick={handleStopTimer}
                        className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartTimer(selectedPermit.id)}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Simulate 30m Fire Watch Clock
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap justify-end gap-3 mt-6">
              {selectedPermit.status === 'draft' && (
                <button 
                  onClick={() => handleApprove(selectedPermit)}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve / Sign Off Permit
                </button>
              )}

              {selectedPermit.status === 'approved' && (
                <button 
                  onClick={() => handleActivate(selectedPermit)}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <Timer className="h-4 w-4 animate-spin" />
                  Commence Hot Work Session
                </button>
              )}

              {selectedPermit.status === 'active' && (
                <button 
                  onClick={() => handleComplete(selectedPermit)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Confirm Cool-down & Complete Job
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Flame className="h-12 w-12 text-slate-700 mb-2" />
            <p className="text-xs">Select a hot work permit or click &apos;Request Permit&apos; to begin.</p>
          </div>
        )}

      </div>

    </div>
  );
}

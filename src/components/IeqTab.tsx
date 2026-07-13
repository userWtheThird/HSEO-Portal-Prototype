import React, { useState } from 'react';
import { 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Settings, 
  Sliders, 
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';
import { User, IeqLog, IeqComplaint } from '../types';

interface IeqTabProps {
  currentUser: User;
  ieqLogs: IeqLog[];
  ieqComplaints: IeqComplaint[];
  onAddComplaint: (complaint: IeqComplaint, logDetails: string) => void;
  onResolveComplaint: (complaintId: string, assignedAction: string, logDetails: string) => void;
  onUpdateSensorLog: (log: IeqLog) => void;
}

export default function IeqTab({
  currentUser,
  ieqLogs,
  ieqComplaints,
  onAddComplaint,
  onResolveComplaint,
  onUpdateSensorLog
}: IeqTabProps) {
  const [isAddingComplaint, setIsAddingComplaint] = useState(false);
  
  // Selected Room Sensor for Interactive Adjustments
  const [selectedLogId, setSelectedLogId] = useState<string>(ieqLogs[0]?.id || '');
  const activeLog = ieqLogs.find(l => l.id === selectedLogId) || ieqLogs[0];

  // Complaint form state
  const [compLocation, setCompLocation] = useState('Main Office Floor Open Space');
  const [compDesc, setCompDesc] = useState('');
  const [actionTexts, setActionTexts] = useState<Record<string, string>>({});

  // Handle live sensor adjustments (simulates real hardware interactions)
  const handleSensorChange = (field: 'co2' | 'voc' | 'temperature' | 'humidity', value: number) => {
    if (!activeLog) return;
    
    const updatedLog = { ...activeLog, [field]: value };
    
    // Dynamically calculate ventilation status based on values
    let ventilationStatus: 'optimal' | 'adequate' | 'poor' = 'optimal';
    if (updatedLog.co2 > 1000 || updatedLog.voc > 500) {
      ventilationStatus = 'poor';
    } else if (updatedLog.co2 > 800 || updatedLog.voc > 300) {
      ventilationStatus = 'adequate';
    }
    
    updatedLog.ventilationStatus = ventilationStatus;
    onUpdateSensorLog(updatedLog);
  };

  // Submit dynamic complaints
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compDesc.trim()) return;

    const newComp: IeqComplaint = {
      id: `comp_${Date.now()}`,
      location: compLocation,
      description: compDesc,
      reporterName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const actionText = `Logged an IEQ air quality complaint for "${compLocation}".`;
    onAddComplaint(newComp, actionText);

    // Reset Form
    setCompDesc('');
    setIsAddingComplaint(false);
  };

  const handleResolve = (complaintId: string, actionText: string) => {
    if (!actionText.trim()) return;
    const auditDetails = `Resolved IEQ complaint ${complaintId} by assigning corrective action: "${actionText}".`;
    onResolveComplaint(complaintId, actionText, auditDetails);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns: Real-Time Zone Air Quality Sensors */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <Wind className="text-emerald-400 h-4 w-4 animate-bounce" />
              Zone Air Quality Telemetry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Tracking ASHRAE fresh air turnover rates, VOC thresholds, and environmental comfort bands.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Select Zone:</span>
            <select 
              value={selectedLogId}
              onChange={(e) => setSelectedLogId(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg p-2 border border-slate-700 cursor-pointer"
            >
              {ieqLogs.map(l => (
                <option key={l.id} value={l.id}>{l.location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Telemetry Panels */}
        {activeLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">CO2 Carbon Dioxide</span>
                <span className={`text-base font-mono font-bold block mt-1.5 ${activeLog.co2 > 900 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {activeLog.co2} ppm
                </span>
                <span className="text-[9px] text-slate-500">Target: &lt;800 ppm</span>
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total VOCs</span>
                <span className={`text-base font-mono font-bold block mt-1.5 ${activeLog.voc > 400 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {activeLog.voc} ppb
                </span>
                <span className="text-[9px] text-slate-500">Target: &lt;300 ppb</span>
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Temperature</span>
                <span className="text-base font-mono font-bold text-slate-200 block mt-1.5">
                  {activeLog.temperature} °C
                </span>
                <span className="text-[9px] text-slate-500">Target: 20°C - 24°C</span>
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Relative Humidity</span>
                <span className="text-base font-mono font-bold text-slate-200 block mt-1.5">
                  {activeLog.humidity}% RH
                </span>
                <span className="text-[9px] text-slate-500">Target: 30% - 60%</span>
              </div>
            </div>

            {/* Interactive Sensor Slider Adjusters */}
            <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl space-y-4 text-left">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Simulate Room Ventilation Loads & Occupancy
              </h4>
              <p className="text-xs text-slate-400">
                Adjust sliders to simulate breathing loads, occupancy surges, or laboratory chemical fume triggers:
              </p>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>CO2 Intake Simulation</span>
                    <span className="font-mono text-emerald-400">{activeLog.co2} ppm</span>
                  </div>
                  <input 
                    type="range" 
                    min="350" 
                    max="1500" 
                    step="10"
                    value={activeLog.co2}
                    onChange={(e) => handleSensorChange('co2', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>VOC Chemical Volatiles Simulation</span>
                    <span className="font-mono text-emerald-400">{activeLog.voc} ppb</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="5"
                    value={activeLog.voc}
                    onChange={(e) => handleSensorChange('voc', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Live ventilation assessment indicator */}
              <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                activeLog.ventilationStatus === 'optimal' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                activeLog.ventilationStatus === 'adequate' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' :
                'bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse'
              }`}>
                {activeLog.ventilationStatus === 'optimal' && (
                  <>
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <strong className="block font-bold">Ventilation Rate: Optimal</strong>
                      <span className="text-slate-300 text-[11px]">ASHRAE Fresh air intake rate provides maximum comfort and clean oxygen turnover.</span>
                    </div>
                  </>
                )}
                {activeLog.ventilationStatus === 'adequate' && (
                  <>
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <strong className="block font-bold">Ventilation Rate: Adequate</strong>
                      <span className="text-slate-300 text-[11px]">Acceptable comfort range. Damper positions are currently handling standard occupant breath loads.</span>
                    </div>
                  </>
                )}
                {activeLog.ventilationStatus === 'poor' && (
                  <>
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <strong className="block font-bold">WARNING: Stagnant Air & high Pollutants</strong>
                      <span className="text-slate-300 text-[11px]">High CO2 or VOCs can trigger headaches, lethargy, or hazardous chemical inhalation. Automated demand-controlled ventilation (DCV) trigger recommended.</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Complaints Logs & Forms */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* LOG COMPLAINT FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
          {isAddingComplaint ? (
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Submit IEQ Complaint</h3>
                <button type="button" onClick={() => setIsAddingComplaint(false)} className="text-slate-400 text-xs">Cancel</button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Occurred Location</label>
                <select 
                  value={compLocation}
                  onChange={(e) => setCompLocation(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Main Office Floor Open Space">Main Office Floor Open Space</option>
                  <option value="Conference Room 3B">Conference Room 3B</option>
                  <option value="Chemical Storage Handling Area D">Chemical Storage Handling Area D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description of Issue</label>
                <textarea 
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="e.g. Excessive stuffiness, mold odor from vents, drafts..."
                  className="w-full h-20 bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-lg transition"
              >
                Log Complaint
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Occupant Comfort Logs</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct reporting channel for HVAC complaints.</p>
              </div>
              <button 
                onClick={() => setIsAddingComplaint(true)}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
              >
                <Plus className="h-3 w-3" />
                Report Issue
              </button>
            </div>
          )}
        </div>

        {/* Complaints List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
            Active Occupancy Feedback
          </h3>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {ieqComplaints.map((comp) => {
              const actionText = actionTexts[comp.id] || '';
              const setActionText = (val: string) => setActionTexts(prev => ({ ...prev, [comp.id]: val }));
              const isResolved = comp.status === 'resolved';

              return (
                <div key={comp.id} className="p-3 bg-slate-800/20 border border-slate-800 rounded-lg space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-300 block text-[11px]">{comp.location}</span>
                      <span className="text-[10px] text-slate-500">By: {comp.reporterName} • {comp.date}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/40 p-2 rounded border border-slate-800/60">
                    &ldquo;{comp.description}&rdquo;
                  </p>

                  {isResolved ? (
                    <div className="p-2 bg-emerald-950/10 border border-emerald-500/25 rounded text-[10px] text-slate-300">
                      <strong className="text-emerald-400 block mb-0.5">HVAC Corrective Work:</strong>
                      {comp.assignedAction}
                    </div>
                  ) : (
                    /* Facilities Engineers can resolve complaints */
                    <div className="flex gap-1.5 pt-1">
                      <input 
                        type="text" 
                        value={actionText}
                        onChange={(e) => setActionText(e.target.value)}
                        placeholder="Assign damper/fan fix..."
                        className="flex-1 bg-slate-800 text-slate-200 text-[11px] rounded px-2 py-1 border border-slate-700 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleResolve(comp.id, actionText)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded transition text-[11px]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-emerald-400" /> IAQ Productivity Link
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            EPA research shows keeping CO2 levels &lt; 600 ppm can boost tenant concentration and memory retention by up to 15%.
          </p>
        </div>
      </div>

    </div>
  );
}

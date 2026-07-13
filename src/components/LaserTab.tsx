import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Check, 
  Eye, 
  BookOpen,
  MapPin
} from 'lucide-react';
import { User, LaserDevice } from '../types';

interface LaserTabProps {
  currentUser: User;
  laserDevices: LaserDevice[];
  onAddLaserDevice: (device: LaserDevice, logDetails: string) => void;
  onUpdateInterlocks: (deviceId: string, status: 'passed' | 'failed', logDetails: string) => void;
  onUpdateTrainingStatus: (deviceId: string, status: 'all_trained' | 'training_needed', logDetails: string) => void;
}

export default function LaserTab({
  currentUser,
  laserDevices,
  onAddLaserDevice,
  onUpdateInterlocks,
  onUpdateTrainingStatus
}: LaserTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [identifier, setIdentifier] = useState('');
  const [model, setModel] = useState('');
  const [laserClass, setLaserClass] = useState<'Class 3B' | 'Class 4'>('Class 4');
  const [wavelength, setWavelength] = useState('');
  const [power, setPower] = useState('');
  const [location, setLocation] = useState('Laboratory Wing A');
  const [custodian, setCustodian] = useState('');

  const handleCreateLaser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !model.trim() || !wavelength.trim() || !power.trim() || !custodian.trim()) return;

    const newDevice: LaserDevice = {
      id: `lsr_${Date.now()}`,
      identifier,
      model,
      laserClass,
      wavelength,
      power,
      location,
      interlockStatus: 'untested',
      trainingStatus: 'training_needed',
      custodian
    };

    const actionText = `Added ${laserClass} Laser "${identifier}" (${model}) to inventory.`;
    onAddLaserDevice(newDevice, actionText);

    // Reset Form
    setIdentifier('');
    setModel('');
    setWavelength('');
    setPower('');
    setCustodian('');
    setIsAdding(false);
  };

  const handleTestInterlocks = (device: LaserDevice) => {
    const passed = Math.random() > 0.1 ? 'passed' : 'failed'; // 90% success probability for simulation
    const actionText = `Conducted interlock trip test on Laser Device "${device.identifier}". Test result: ${passed.toUpperCase()}.`;
    onUpdateInterlocks(device.id, passed, actionText);
  };

  const handleToggleTraining = (device: LaserDevice) => {
    const nextStatus = device.trainingStatus === 'all_trained' ? 'training_needed' : 'all_trained';
    const actionText = `Updated laser safety training verification status for Laser "${device.identifier}" to ${nextStatus === 'all_trained' ? 'FULLY TRAINED' : 'TRAINING OUTSTANDING'}.`;
    onUpdateTrainingStatus(device.id, nextStatus, actionText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns: Laser Registry List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <Zap className="text-purple-400 h-4 w-4 animate-bounce" />
              High-Power Laser Register
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Inventory and compliance controls for Class 3B and Class 4 hazardous laser installations.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Register Laser
          </button>
        </div>

        <div className="space-y-4">
          {laserDevices.map((laser) => {
            let interlockBadgeColor = 'bg-slate-800 text-slate-400';
            if (laser.interlockStatus === 'passed') interlockBadgeColor = 'bg-emerald-500/10 text-emerald-400';
            else if (laser.interlockStatus === 'failed') interlockBadgeColor = 'bg-rose-500/15 text-rose-400 border border-rose-500/20';

            let trainingBadgeColor = laser.trainingStatus === 'all_trained' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-amber-500/10 text-amber-400';

            return (
              <div key={laser.id} className="p-4 bg-slate-800/15 border border-slate-800 rounded-xl text-left hover:border-slate-700/60 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{laser.identifier}</span>
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold px-1.5 py-0.5 rounded border border-rose-500/20">
                        {laser.laserClass}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">{laser.model} ({laser.wavelength})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${interlockBadgeColor}`}>
                      Interlocks: {laser.interlockStatus.toUpperCase()}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${trainingBadgeColor}`}>
                      Training: {laser.trainingStatus === 'all_trained' ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Loc: <strong className="text-slate-300">{laser.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Power: <strong className="text-slate-300">{laser.power}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Custodian: <strong className="text-slate-300">{laser.custodian}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/50">
                  <button 
                    onClick={() => handleToggleTraining(laser)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-slate-700"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                    Toggle Training Log
                  </button>
                  <button 
                    onClick={() => handleTestInterlocks(laser)}
                    className="bg-purple-600/10 hover:bg-purple-600 hover:text-white text-purple-400 text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-purple-500/20"
                  >
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    Test Interlocks & Trip Sensors
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Add Form OR Safety Guidelines */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1 min-h-[300px]">
        {isAdding ? (
          <form onSubmit={handleCreateLaser} className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Register Laser</h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 text-xs">Cancel</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Laser Identifier Code</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. LSR-0912"
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Manufacturer & Model</label>
              <input 
                type="text" 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Coherent Verdi-G5"
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Laser Classification</label>
              <select 
                value={laserClass}
                onChange={(e) => setLaserClass(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Class 4">Class 4 (Extreme Hazard)</option>
                <option value="Class 3B">Class 3B (Medium Hazard)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Wavelength</label>
                <input 
                  type="text" 
                  value={wavelength}
                  onChange={(e) => setWavelength(e.target.value)}
                  placeholder="e.g. 532 nm (Green)"
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Optical Power Output</label>
                <input 
                  type="text" 
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="e.g. 5 W, 500 mW"
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Facility Lab Area</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Lab Custodian</label>
              <input 
                type="text" 
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                placeholder="e.g. Dr. Elena Rostova"
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 rounded-lg transition"
            >
              Save Laser Registry
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              Laser Eye & Signage Controls
            </h3>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>
                Class 3B and Class 4 laser hazard zones require protective interlocks on entryways, and optical densities (OD) specified for wavelengths present.
              </p>
              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">Safety Checklist (ANSI Z136):</span>
                <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                  <li>Active lighted entry warning sign</li>
                  <li>Wavelength-specific goggles present</li>
                  <li>Emergency shut-off switch clear</li>
                  <li>Diffuse beam reflection controls</li>
                </ul>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Note: Failing interlocks require immediate lockout-tagout (LOTO) protocols. High reflective surfaces are strictly forbidden within the path of direct or collateral radiation.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

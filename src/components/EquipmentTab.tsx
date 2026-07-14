import React, { useState } from 'react';
import { 
  Wrench, Plus, Search, Edit, Trash2, X, Save, AlertTriangle, CheckCircle, Clock, Package 
} from 'lucide-react';
import { User, Equipment } from '../types';

interface EquipmentTabProps {
  currentUser: User;
  equipment: Equipment[];
  onAddEquipment: (eq: Equipment, logDetails: string) => void;
  onUpdateEquipment: (eq: Equipment, logDetails: string) => void;
  onDeleteEquipment: (eqId: string, logDetails: string) => void;
}

const EQUIPMENT_CATEGORIES = [
  'Dust Monitor', 'Noise Dosimeter', 'Gas Detector', 'NIR Sensor', 'Air Sampler', 'VOC Meter', 'Other'
];

export default function EquipmentTab({
  currentUser, equipment, onAddEquipment, onUpdateEquipment, onDeleteEquipment
}: EquipmentTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);

  // Add form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(EQUIPMENT_CATEGORIES[0]);
  const [newSerial, setNewSerial] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newLastCal, setNewLastCal] = useState('');
  const [newNextCal, setNewNextCal] = useState('');
  const [newStatus, setNewStatus] = useState<Equipment['status']>('Active');
  const [newAssignedLoc, setNewAssignedLoc] = useState('');

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSerial, setEditSerial] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editLastCal, setEditLastCal] = useState('');
  const [editNextCal, setEditNextCal] = useState('');
  const [editStatus, setEditStatus] = useState<Equipment['status']>('Active');
  const [editAssignedLoc, setEditAssignedLoc] = useState('');

  const resetAddForm = () => {
    setNewName(''); setNewCategory(EQUIPMENT_CATEGORIES[0]); setNewSerial('');
    setNewManufacturer(''); setNewLastCal(''); setNewNextCal('');
    setNewStatus('Active'); setNewAssignedLoc('');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSerial) { alert('Name and Serial Number are required.'); return; }
    const eq: Equipment = {
      id: `eq_${Date.now()}`, name: newName, category: newCategory, serialNumber: newSerial,
      manufacturer: newManufacturer, lastCalibrationDate: newLastCal, nextCalibrationDate: newNextCal,
      status: newStatus, assignedLocation: newAssignedLoc || undefined
    };
    onAddEquipment(eq, `Registered equipment "${newName}" (S/N: ${newSerial}).`);
    resetAddForm();
    setShowAddForm(false);
  };

  const startEdit = (eq: Equipment) => {
    setEditingEq(eq);
    setEditName(eq.name); setEditCategory(eq.category); setEditSerial(eq.serialNumber);
    setEditManufacturer(eq.manufacturer); setEditLastCal(eq.lastCalibrationDate);
    setEditNextCal(eq.nextCalibrationDate); setEditStatus(eq.status);
    setEditAssignedLoc(eq.assignedLocation || '');
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEq) return;
    const updated: Equipment = {
      ...editingEq, name: editName, category: editCategory, serialNumber: editSerial,
      manufacturer: editManufacturer, lastCalibrationDate: editLastCal, nextCalibrationDate: editNextCal,
      status: editStatus, assignedLocation: editAssignedLoc || undefined
    };
    onUpdateEquipment(updated, `Updated equipment "${editName}" (S/N: ${editSerial}).`);
    setEditingEq(null);
  };

  const handleDelete = (eq: Equipment) => {
    if (confirm(`Delete "${eq.name}"? This cannot be undone.`)) {
      onDeleteEquipment(eq.id, `Deleted equipment "${eq.name}" (S/N: ${eq.serialNumber}).`);
    }
  };

  const statusBadge = (status: Equipment['status']) => {
    const styles: Record<string, string> = {
      'Active': 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30',
      'Calibration Due': 'bg-amber-950/40 text-amber-400 border-amber-900/30',
      'Out for calibration': 'bg-blue-950/40 text-blue-400 border-blue-900/30',
      'Out of Service': 'bg-rose-950/40 text-rose-400 border-rose-900/30'
    };
    return (
      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${styles[status] || styles['Active']}`}>
        {status}
      </span>
    );
  };

  const filtered = equipment.filter(eq => {
    const q = searchQuery.toLowerCase();
    return eq.name.toLowerCase().includes(q) || eq.serialNumber.toLowerCase().includes(q) ||
      eq.category.toLowerCase().includes(q) || eq.manufacturer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Equipment Registry</span>
          <span className="text-xs text-slate-300">Managing {equipment.length} instruments & monitoring devices.</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" placeholder="Search equipment..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 w-52 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button onClick={() => { setShowAddForm(true); setEditingEq(null); resetAddForm(); }}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition">
            <Plus className="h-4 w-4" /> Register Equipment
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-amber-500/20 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-4 w-4 text-amber-400" /> Register New Equipment
            </h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Equipment Name *</label>
              <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. DustTrak DRX 8533"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Category *</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none">
                {EQUIPMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Serial Number *</label>
              <input required value={newSerial} onChange={(e) => setNewSerial(e.target.value)} placeholder="e.g. DT8533-2024-001"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Manufacturer</label>
              <input value={newManufacturer} onChange={(e) => setNewManufacturer(e.target.value)} placeholder="e.g. TSI Incorporated"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Last Calibration Date</label>
              <input type="date" value={newLastCal} onChange={(e) => setNewLastCal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Next Calibration Date</label>
              <input type="date" value={newNextCal} onChange={(e) => setNewNextCal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Equipment['status'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none">
                <option value="Active">Active</option>
                <option value="Calibration Due">Calibration Due</option>
                <option value="Out for calibration">Out for calibration</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Location</label>
              <input value={newAssignedLoc} onChange={(e) => setNewAssignedLoc(e.target.value)} placeholder="e.g. UST"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
            <button type="button" onClick={() => setShowAddForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition">Cancel</button>
            <button type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition">
              <Save className="h-3.5 w-3.5 inline mr-1" /> Register Equipment
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editingEq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleEdit} className="bg-slate-900 border border-amber-500/20 rounded-xl p-5 space-y-4 shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Edit className="h-4 w-4 text-amber-400" /> Edit Equipment
              </h3>
              <button type="button" onClick={() => setEditingEq(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Equipment Name *</label>
                <input required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Category *</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none">
                  {EQUIPMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Serial Number *</label>
                <input required value={editSerial} onChange={(e) => setEditSerial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Manufacturer</label>
                <input value={editManufacturer} onChange={(e) => setEditManufacturer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Last Calibration</label>
                <input type="date" value={editLastCal} onChange={(e) => setEditLastCal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Next Calibration</label>
                <input type="date" value={editNextCal} onChange={(e) => setEditNextCal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Equipment['status'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Calibration Due">Calibration Due</option>
                  <option value="Out for calibration">Out for calibration</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Location</label>
                <input value={editAssignedLoc} onChange={(e) => setEditAssignedLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button type="button" onClick={() => setEditingEq(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition">Cancel</button>
              <button type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition">
                <Save className="h-3.5 w-3.5 inline mr-1" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Serial No.</th>
                <th className="px-4 py-3">Manufacturer</th>
                <th className="px-4 py-3 w-28">Last Calibrated</th>
                <th className="px-4 py-3 w-28">Next Calibration</th>
                <th className="px-4 py-3 w-32 text-center">Status</th>
                <th className="px-4 py-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length > 0 ? filtered.map(eq => (
                <tr key={eq.id} className="hover:bg-slate-800/20 transition">
                  <td className="px-4 py-3 font-semibold text-slate-100">{eq.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-amber-400 font-mono">
                      {eq.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{eq.serialNumber}</td>
                  <td className="px-4 py-3">{eq.manufacturer}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{eq.lastCalibrationDate || '—'}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{eq.nextCalibrationDate || '—'}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(eq.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => startEdit(eq)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(eq)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <Wrench className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                    <p>No equipment found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

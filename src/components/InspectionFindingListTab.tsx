import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Filter,
  AlertTriangle,
  Shield,
  FileText,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { User, InspectionFinding } from '../types';

interface InspectionFindingListTabProps {
  currentUser: User;
  findings: InspectionFinding[];
  onSaveFindings: (findings: InspectionFinding[]) => void;
}

const FINDING_CATEGORIES = [
  'Fire Safety',
  'BioSafety',
  'Chemical Safety',
  'Air Ventilation',
  'Electrical Safety',
  'Radiation Safety',
  'General Housekeeping',
  'PPE Compliance',
  'Emergency Preparedness',
  'Hazardous Materials'
];

const ACTION_LEVELS: ('I' | 'II' | 'III')[] = ['I', 'II', 'III'];

// Permission check: only superadmin, admin, hseo_management can edit
const canEdit = (role: string): boolean => {
  return ['superadmin', 'admin', 'hseo_management'].includes(role);
};

export default function InspectionFindingListTab({ 
  currentUser, 
  findings, 
  onSaveFindings 
}: InspectionFindingListTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFinding, setEditingFinding] = useState<InspectionFinding | null>(null);
  
  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formShortObservation, setFormShortObservation] = useState('');
  const [formActionLevel, setFormActionLevel] = useState<'I' | 'II' | 'III'>('I');
  const [formDescription, setFormDescription] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');

  // Auto-generate finding code based on category
  const generateFindingCode = (category: string): string => {
    const codeMap: Record<string, string> = {
      'Fire Safety': 'FS',
      'BioSafety': 'BS',
      'Chemical Safety': 'CS',
      'Air Ventilation': 'AV',
      'Electrical Safety': 'ES',
      'Radiation Safety': 'RS',
      'General Housekeeping': 'GH',
      'PPE Compliance': 'PP',
      'Emergency Preparedness': 'EP',
      'Hazardous Materials': 'HM'
    };
    const prefix = codeMap[category] || category.substring(0, 2).toUpperCase();
    // Count existing findings in this category and add 1
    const countInCategory = findings.filter(f => f.category === category).length;
    return `${prefix}-${String(countInCategory + 1).padStart(3, '0')}`;
  };

  // Handle category change in form - auto-generate code
  const handleFormCategoryChange = (category: string) => {
    setFormCategory(category);
    if (category) {
      setFormCode(generateFindingCode(category));
    } else {
      setFormCode('');
    }
  };

  const isEditable = canEdit(currentUser.role);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter findings
  const filteredFindings = findings.filter(f => {
    const matchesSearch = searchTerm === '' || 
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.findingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.shortObservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.followUpAction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Download findings as CSV
  const handleDownloadCSV = () => {
    const headers = ['Category', 'Finding Code', 'Short Observation', 'Action Level', 'Description', 'Follow-up Action'];
    const rows = findings.map(f => [
      f.category,
      f.findingCode,
      `"${(f.shortObservation || '').replace(/"/g, '""')}"`,
      f.actionLevel,
      `"${f.description.replace(/"/g, '""')}"`,
      `"${f.followUpAction.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspection_Finding_List_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download findings as JSON
  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(findings, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspection_Finding_List_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Upload findings from file
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedFindings: InspectionFinding[];

        if (file.name.endsWith('.json')) {
          // Parse JSON
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            alert('Invalid JSON format. Expected an array of findings.');
            return;
          }
          importedFindings = parsed.map((item: any, index: number) => ({
            id: item.id || `finding_imported_${Date.now()}_${index}`,
            category: item.category || '',
            findingCode: item.findingCode || item.finding_code || '',
            shortObservation: item.shortObservation || item.short_observation || '',
            actionLevel: item.actionLevel || item.action_level || 'I',
            description: item.description || '',
            followUpAction: item.followUpAction || item.follow_up_action || '',
            createdBy: currentUser.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            alert('CSV file is empty or has no data rows.');
            return;
          }
          // Skip header row
          importedFindings = lines.slice(1).map((line, index) => {
            // Simple CSV parsing (handles quoted fields)
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            return {
              id: `finding_imported_${Date.now()}_${index}`,
              category: values[0] || '',
              findingCode: values[1] || '',
              shortObservation: values[2] || '',
              actionLevel: (values[3] as 'I' | 'II' | 'III') || 'I',
              description: values[4] || '',
              followUpAction: values[5] || '',
              createdBy: currentUser.name,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
        } else {
          alert('Unsupported file format. Please upload a CSV or JSON file.');
          return;
        }

        // Validate and filter out invalid entries
        const validFindings = importedFindings.filter(f => 
          f.category && f.findingCode && f.shortObservation && f.description && f.followUpAction
        );

        if (validFindings.length === 0) {
          alert('No valid findings found in the file. Please check the format.');
          return;
        }

        // Confirm import
        const action = findings.length > 0 
          ? `This will add ${validFindings.length} finding(s) to the existing ${findings.length} finding(s). Continue?`
          : `This will import ${validFindings.length} finding(s). Continue?`;
        
        if (confirm(action)) {
          onSaveFindings([...findings, ...validFindings]);
          alert(`Successfully imported ${validFindings.length} finding(s).`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form
  const resetForm = () => {
    setFormCategory('');
    setFormCode('');
    setFormShortObservation('');
    setFormActionLevel('I');
    setFormDescription('');
    setFormFollowUp('');
  };

  // Open add modal
  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (finding: InspectionFinding) => {
    setEditingFinding(finding);
    setFormCategory(finding.category);
    setFormCode(finding.findingCode);
    setFormShortObservation(finding.shortObservation || '');
    setFormActionLevel(finding.actionLevel);
    setFormDescription(finding.description);
    setFormFollowUp(finding.followUpAction);
    setShowAddModal(true);
  };

  // Save finding (add or edit)
  const handleSave = () => {
    if (!formCategory || !formCode || !formShortObservation || !formDescription || !formFollowUp) {
      alert('Please fill in all fields');
      return;
    }

    const now = new Date().toISOString();

    if (editingFinding) {
      // Edit existing
      const updated = findings.map(f => 
        f.id === editingFinding.id 
          ? { 
              ...f, 
              category: formCategory,
              findingCode: formCode,
              shortObservation: formShortObservation,
              actionLevel: formActionLevel,
              description: formDescription,
              followUpAction: formFollowUp,
              updatedAt: now
            }
          : f
      );
      onSaveFindings(updated);
    } else {
      // Add new
      const newFinding: InspectionFinding = {
        id: `finding_${Date.now()}`,
        category: formCategory,
        findingCode: formCode,
        shortObservation: formShortObservation,
        actionLevel: formActionLevel,
        description: formDescription,
        followUpAction: formFollowUp,
        createdBy: currentUser.name,
        createdAt: now,
        updatedAt: now
      };
      onSaveFindings([newFinding, ...findings]);
    }

    setShowAddModal(false);
    setEditingFinding(null);
    resetForm();
  };

  // Delete finding
  const handleDelete = (finding: InspectionFinding) => {
    if (!confirm(`Are you sure you want to delete finding "${finding.findingCode}: ${finding.description}"?`)) {
      return;
    }
    const updated = findings.filter(f => f.id !== finding.id);
    onSaveFindings(updated);
  };

  // Get action level color
  const getActionLevelColor = (level: string): string => {
    switch (level) {
      case 'I': return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
      case 'II': return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      case 'III': return 'bg-sky-950/40 text-sky-400 border-sky-900/30';
      default: return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Inspection Finding List
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standardized findings database for inspection reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Download buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadCSV}
              disabled={findings.length === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              title="Download as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              disabled={findings.length === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              title="Download as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
          {/* Upload button */}
          {isEditable && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.json"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-slate-700"
                title="Upload from CSV or JSON file"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            </>
          )}
          {/* Add Finding button */}
          {isEditable && (
            <button
              onClick={handleOpenAdd}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Finding
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code, description, or follow-up action..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-600/50"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 cursor-pointer appearance-none"
          >
            <option value="">All Categories</option>
            {FINDING_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Short Observation</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Follow-up Action</th>
                {isEditable && <th className="px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredFindings.length > 0 ? (
                filteredFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-slate-800/20 transition">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{finding.findingCode}</td>
                    <td className="px-4 py-3 text-slate-400">{finding.category}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{finding.shortObservation || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${getActionLevelColor(finding.actionLevel)}`}>
                        {finding.actionLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{finding.description}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{finding.followUpAction}</td>
                    {isEditable && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(finding)}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-amber-600/20 hover:text-amber-400 text-slate-500 transition border border-slate-700/50 hover:border-amber-600/40"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(finding)}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-600/20 hover:text-rose-400 text-slate-500 transition border border-slate-700/50 hover:border-rose-600/40"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isEditable ? 7 : 6} className="px-4 py-12 text-center text-slate-500">
                    <FileText className="h-8 w-8 mx-auto text-slate-700 mb-2 animate-pulse" />
                    <p className="text-xs">
                      {searchTerm || categoryFilter 
                        ? 'No findings matching your search/filter criteria.'
                        : 'No findings have been added yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <span className="text-slate-500">Total Findings:</span>
          <span className="font-bold text-slate-200 ml-2">{findings.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <span className="text-slate-500">Filtered:</span>
          <span className="font-bold text-amber-400 ml-2">{filteredFindings.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <span className="text-slate-500">Categories:</span>
          <span className="font-bold text-slate-200 ml-2">{new Set(findings.map(f => f.category)).size}</span>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-amber-600/30 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                {editingFinding ? <Edit className="h-4 w-4 text-amber-500" /> : <Plus className="h-4 w-4 text-amber-500" />}
                {editingFinding ? 'Edit Finding' : 'Add New Finding'}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingFinding(null); resetForm(); }}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleFormCategoryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Category --</option>
                    {FINDING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Finding Code (Auto-generated)</label>
                  <input
                    type="text"
                    value={formCode}
                    readOnly
                    placeholder="Select category first"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Short Observation *</label>
                <input
                  type="text"
                  value={formShortObservation}
                  onChange={(e) => setFormShortObservation(e.target.value)}
                  placeholder="Brief observation title for dropdown selection"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Action Level *</label>
                <div className="flex gap-2">
                  {ACTION_LEVELS.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormActionLevel(level)}
                      className={`flex-1 py-2 rounded text-xs font-bold border transition ${
                        formActionLevel === level
                          ? getActionLevelColor(level) + ' ring-1 ring-current'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Finding Description *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the finding..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Follow-up Action *</label>
                <textarea
                  value={formFollowUp}
                  onChange={(e) => setFormFollowUp(e.target.value)}
                  placeholder="Describe the required follow-up action..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 p-4">
              <button
                onClick={() => { setShowAddModal(false); setEditingFinding(null); resetForm(); }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition flex items-center gap-1.5 shadow"
              >
                <Save className="h-3.5 w-3.5" />
                {editingFinding ? 'Update' : 'Add'} Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

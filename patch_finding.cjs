const fs = require('fs');
let code = fs.readFileSync('src/components/InspectionTab.tsx', 'utf-8');

const importReplacement = `import { ClipboardCheck, FileCheck, Search, Plus, Calendar, AlertTriangle, Check, X, ShieldCheck, Clock, User, ChevronRight, Download, Camera, Image as ImageIcon } from 'lucide-react';`;
code = code.replace(/import \{ ClipboardCheck[^\n]+lucide-react';/, importReplacement);

const newStates = `
  const [newFindingFollowUp, setNewFindingFollowUp] = useState('');
  const [newFindingPhoto, setNewFindingPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const max_width = 480;
        const max_height = 960;

        if (width > height) {
          if (width > max_width) {
            height *= max_width / width;
            width = max_width;
          }
        } else {
          if (height > max_height) {
            width *= max_height / height;
            height = max_height;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewFindingPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
`;

code = code.replace(/const \[newFindingContactId, setNewFindingContactId\] = useState\(''\);/, `const [newFindingContactId, setNewFindingContactId] = useState('');${newStates}`);

const addFindingReplacement = `
  const handleAddFinding = () => {
    if (!selectedInspection || !newFindingDesc.trim()) return;
    
    const newFinding: Finding = {
      id: 'finding_' + Date.now(),
      category: newFindingCat,
      description: newFindingDesc,
      status: 'open',
      severity: newFindingLevel === 3 ? 'high' : newFindingLevel === 2 ? 'medium' : 'low',
      actionLevel: newFindingLevel,
      referredContactId: newFindingContactId || undefined,
      followUpActions: newFindingFollowUp,
      photoUrl: newFindingPhoto || undefined
    };

    const updated = {
      ...selectedInspection,
      score: Math.max(0, selectedInspection.score - (newFindingLevel * 5)),
      findings: [...selectedInspection.findings, newFinding]
    };
    onUpdateInspection(updated);
    setIsDraftingFinding(false);
    setNewFindingDesc('');
    setNewFindingLevel(1);
    setNewFindingFollowUp('');
    setNewFindingPhoto(null);
  };
`;
code = code.replace(/const handleAddFinding = \(\) => \{[\s\S]+?setNewFindingLevel\(1\);\n  \};/, addFindingReplacement);

const draftFormReplacement = `              {isDraftingFinding && (
                <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                      <select value={newFindingCat} onChange={e => setNewFindingCat(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Action Level (1-3)</label>
                      <select value={newFindingLevel} onChange={e => setNewFindingLevel(Number(e.target.value) as 1|2|3)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                        <option value={1}>Level 1 (Minor)</option>
                        <option value={2}>Level 2 (Moderate)</option>
                        <option value={3}>Level 3 (Urgent)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Refer to Contact Person</label>
                    <select value={newFindingContactId} onChange={e => setNewFindingContactId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                      <option value="">-- Optional --</option>
                      {selectedLocation?.contactPersonIds.map(id => (
                        <option key={id} value={id}>{getPersonName(id)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Finding Description</label>
                    <textarea value={newFindingDesc} onChange={e => setNewFindingDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white" rows={2}></textarea>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Follow-up Actions Required (for PI/Contact)</label>
                    <textarea value={newFindingFollowUp} onChange={e => setNewFindingFollowUp(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white" rows={2} placeholder="Explain what the PI needs to do to resolve this..."></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Upload Photo (Auto-resizes to 480x960 max)</label>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition">
                      {newFindingPhoto ? (
                        <div className="flex flex-col items-center">
                           <img src={newFindingPhoto} alt="Preview" className="h-20 object-contain rounded mb-2" />
                           <span className="text-[10px] text-slate-300">Click to change photo</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="h-6 w-6 text-slate-500 mb-1" />
                          <span className="text-xs text-slate-400">Select Image</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsDraftingFinding(false)} className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                    <button onClick={handleAddFinding} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Save Finding</button>
                  </div>
                </div>
              )}`;

code = code.replace(/\{isDraftingFinding && \([\s\S]+?Save Finding<\/button>\n                  <\/div>\n                <\/div>\n              \)\}/, draftFormReplacement);

const findingDisplayCode = `
          <p className="text-xs text-slate-200">{finding.description}</p>
          
          {finding.photoUrl && (
            <div className="mt-2">
              <img src={finding.photoUrl} alt="Finding evidence" className="max-h-32 object-contain rounded border border-slate-700" />
            </div>
          )}

          {finding.followUpActions && (
            <div className="mt-2 p-2 bg-indigo-900/10 rounded border border-indigo-500/20 text-xs">
              <span className="text-indigo-400 font-bold">Follow-up Action Required: </span>
              <span className="text-slate-300">{finding.followUpActions}</span>
            </div>
          )}
          
          {/* Rectification / Resolution details */}
`;
code = code.replace(/<p className="text-xs text-slate-200">\{finding\.description\}<\/p>\n\s+\{\/\* Rectification \/ Resolution details \*\/\}/, findingDisplayCode);

fs.writeFileSync('src/components/InspectionTab.tsx', code);

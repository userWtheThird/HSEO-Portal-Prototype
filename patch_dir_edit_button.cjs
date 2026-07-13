const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

// Replace selection logic to close edit form
code = code.replace(/setSelectedPersonId\(pers\.id\);\n\s*setSelectedLocationId\(null\);/g, "setSelectedPersonId(pers.id);\n                        setSelectedLocationId(null);\n                        setIsEditingPerson(false);");

// Add Edit Button in details header
const headerPattern = `<div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className={\`text-[8px] font-bold px-2 py-0.5 rounded border uppercase \${
                    selectedPers.role === 'PI' 
                      ? 'bg-amber-950/40 text-amber-500 border-amber-900/50' 
                      : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50'
                  }\`}>
                    {selectedPers.role === 'PI' ? 'Principal Investigator' : selectedPers.role}
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100 mt-1.5 flex items-center gap-1.5">
                    <User className="h-4.5 w-4.5 text-indigo-500" />
                    {selectedPers.name}
                  </h2>
                  {selectedPers.title && <p className="text-xs text-slate-400 mt-0.5 italic">{selectedPers.title}</p>}
                </div>
                <button 
                  onClick={() => setSelectedPersonId(null)} 
                  className="text-slate-500 hover:text-slate-300 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>`;

const newHeader = `<div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex gap-2">
                    <span className={\`text-[8px] font-bold px-2 py-0.5 rounded border uppercase \${
                      selectedPers.role === 'PI' 
                        ? 'bg-amber-950/40 text-amber-500 border-amber-900/50' 
                        : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50'
                    }\`}>
                      {selectedPers.role === 'PI' ? 'Principal Investigator' : selectedPers.role}
                    </span>
                    <span className={\`text-[8px] font-bold px-2 py-0.5 rounded border uppercase \${
                      selectedPers.status === 'Inactive' 
                        ? 'bg-rose-950/40 text-rose-500 border-rose-900/50' 
                        : 'bg-emerald-950/40 text-emerald-500 border-emerald-900/50'
                    }\`}>
                      {selectedPers.status === 'Inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-100 mt-1.5 flex items-center gap-1.5">
                    <User className="h-4.5 w-4.5 text-indigo-500" />
                    {selectedPers.name}
                  </h2>
                  {selectedPers.title && <p className="text-xs text-slate-400 mt-0.5 italic">{selectedPers.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditPersName(selectedPers.name);
                      setEditPersRole(selectedPers.role);
                      setEditPersDept(selectedPers.department);
                      setEditPersEmail(selectedPers.email);
                      setEditPersPhone(selectedPers.phone);
                      setEditPersTitle(selectedPers.title || '');
                      setEditPersStatus(selectedPers.status || 'Active');
                      setIsEditingPerson(true);
                    }}
                    className="text-xs bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900 px-2 py-1 rounded transition border border-indigo-500/30 font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setSelectedPersonId(null)} 
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>`;

code = code.replace(headerPattern, newHeader);
fs.writeFileSync('src/components/DirectoryTab.tsx', code);

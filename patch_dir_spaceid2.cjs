const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const s1 = `<h3 className="text-sm font-bold text-slate-200">
                            {loc.building}, Room {loc.roomNumber}
                          </h3>`;

const r1 = `<h3 className="text-sm font-bold text-slate-200">
                            {loc.building}, Room {loc.roomNumber} <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2">{loc.spaceID}</span>
                          </h3>`;
code = code.replace(s1, r1);

// Let's also include it in the details view 
const s2 = `<h2 className="text-lg font-bold text-slate-100">{selectedLoc.building}, Rm {selectedLoc.roomNumber}</h2>`;
const r2 = `<div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-100">{selectedLoc.building}, Rm {selectedLoc.roomNumber}</h2>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold uppercase">{selectedLoc.spaceID}</span>
                      </div>`;
code = code.replace(s2, r2);

// Let's also include it in the search logic
code = code.replace(/loc\.roomNumber\.toLowerCase\(\)\.includes\(query\) \|\|/, "loc.roomNumber.toLowerCase().includes(query) ||\n      (loc.spaceID && loc.spaceID.toLowerCase().includes(query)) ||");

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

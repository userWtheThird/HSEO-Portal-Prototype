const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const oldListingBadge = `                              {pers.role === 'PI' ? 'Principal Investigator (PI)' : pers.role}
                            </span>
                            <span className="text-[10px] text-slate-500">{pers.department}</span>`;

const newListingBadge = `                              {pers.role === 'PI' ? 'Principal Investigator (PI)' : pers.role}
                            </span>
                            <span className={\`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border \${
                              pers.status === 'Inactive'
                                ? 'bg-rose-950/40 text-rose-500 border-rose-900/50'
                                : 'bg-emerald-950/40 text-emerald-500 border-emerald-900/50'
                            }\`}>
                              {pers.status === 'Inactive' ? 'Inactive' : 'Active'}
                            </span>
                            <span className="text-[10px] text-slate-500">{pers.department}</span>`;

code = code.replace(oldListingBadge, newListingBadge);
fs.writeFileSync('src/components/DirectoryTab.tsx', code);

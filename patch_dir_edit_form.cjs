const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const detailBodyStart = `              {/* Personal Contact Details */}`;
const editFormCode = `              {isEditingPerson ? (
                <form onSubmit={handleUpdatePersonSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Full Name *</label>
                      <input type="text" required value={editPersName} onChange={e => setEditPersName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                      <input type="text" required value={editPersDept} onChange={e => setEditPersDept(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Role</label>
                      <select value={editPersRole} onChange={e => setEditPersRole(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="Staff">Staff</option>
                        <option value="PI">Principal Investigator (PI)</option>
                        <option value="Officer">Safety Officer</option>
                        <option value="Contact">Emergency Contact</option>
                        <option value="FTM">Field Team Member (FTM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title</label>
                      <input type="text" value={editPersTitle} onChange={e => setEditPersTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Email *</label>
                      <input type="email" required value={editPersEmail} onChange={e => setEditPersEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Phone</label>
                      <input type="text" value={editPersPhone} onChange={e => setEditPersPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
                      <select value={editPersStatus} onChange={e => setEditPersStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingPerson(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition">Save Changes</button>
                  </div>
                </form>
              ) : (
                <>
              {/* Personal Contact Details */}`;

code = code.replace(detailBodyStart, editFormCode);

// Add the closing tag for the conditionally rendered details
const detailsEnd = `                </div>
              </div>
            </div>`;
const newDetailsEnd = `                </div>
              </div>
              </>
            )}
            </div>`;

code = code.replace(detailsEnd, newDetailsEnd);

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

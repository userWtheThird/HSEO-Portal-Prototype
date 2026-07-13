const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const regex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>\s*\}\)\s*\)\s*:\s*\(/;
// Wait, regex might be tricky. Let's just find the index of "/* DEFAULT EMPTY PANEL STATE */" and replace the preceding lines.

const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('/* DEFAULT EMPTY PANEL STATE */'));

if (idx > -1) {
  // Let's grab from idx - 10 to idx
  // We want to replace the end of the selectedPers ? block
  // with a cleanly matched one.
  
  // The correct ending should be:
  //                 </div>
  //               </div>
  //               </>
  //             )}
  //             </div>
  //           ) : (
  
  // Let's just replace lines from where it says `No inspections linked to this PI`
  // up to `/* DEFAULT EMPTY PANEL STATE */`
  
  const searchStr = '{inspections.filter(i => i.piId === selectedPers.id).length === 0 && (';
  const startIdx = lines.findIndex(l => l.includes(searchStr));
  
  if (startIdx > -1) {
    const endIdx = idx;
    
    const correctEnding = `                    {inspections.filter(i => i.piId === selectedPers.id).length === 0 && (
                      <span className="text-slate-600 italic text-[10px] block pl-1">No inspections linked to this PI</span>
                    )}
                  </div>
                </div>
              </div>
              </>
            )}
            </div>
          ) : (`;
          
    lines.splice(startIdx, endIdx - startIdx, correctEnding);
    fs.writeFileSync('src/components/DirectoryTab.tsx', lines.join('\n'));
    console.log("Fixed!");
  }
}

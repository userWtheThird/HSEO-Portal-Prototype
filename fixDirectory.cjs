const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

code = code.replace(/personInChargeId: newLocPI,/g, 'piIds: newLocPI ? [newLocPI] : [],');
code = code.replace(/l.personInChargeId === piId/g, 'l.piIds.includes(piId)');
code = code.replace(/getPersonName\(loc\.personInChargeId\)/g, "loc.piIds.map(getPersonName).join(', ') || 'Unknown'");
code = code.replace(/setSelectedPersonId\(selectedLoc\.personInChargeId\);/g, "setSelectedPersonId(selectedLoc.piIds[0] || null);");
code = code.replace(/getPersonName\(selectedLoc\.personInChargeId\)/g, "selectedLoc.piIds.map(getPersonName).join(', ')");
code = code.replace(/l.personInChargeId === selectedPers.id/g, 'l.piIds.includes(selectedPers.id)');

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

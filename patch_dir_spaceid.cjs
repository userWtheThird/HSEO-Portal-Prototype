const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
code = code.replace(/roomNumber: newLocRoom,/, "roomNumber: newLocRoom,\n      spaceID: `${newLocBuilding}${newLocRoom}`,");
fs.writeFileSync('src/components/DirectoryTab.tsx', code);

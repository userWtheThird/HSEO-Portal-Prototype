const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/roomNumber: string;/, "roomNumber: string;\n  spaceID: string;");
fs.writeFileSync('src/types.ts', code);

let mockCode = fs.readFileSync('src/mockData.ts', 'utf-8');
// Assuming mock locations are objects, we can inject spaceID
const lines = mockCode.split('\n');
let inLocation = false;
let currentBuilding = '';
let currentRoom = '';
let lastObjStart = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const SIMULATED_LOCATIONS: Location[] = [')) {
    inLocation = true;
  }
  if (inLocation && lines[i].includes('export const')) {
    if (!lines[i].includes('SIMULATED_LOCATIONS')) {
      inLocation = false;
    }
  }

  if (inLocation) {
    const bMatch = lines[i].match(/building: '([^']+)'/);
    if (bMatch) currentBuilding = bMatch[1];
    
    const rMatch = lines[i].match(/roomNumber: '([^']+)'/);
    if (rMatch) {
      currentRoom = rMatch[1];
      // Insert spaceID after roomNumber
      lines.splice(i + 1, 0, `    spaceID: '${currentBuilding}${currentRoom}',`);
      i++;
    }
  }
}
fs.writeFileSync('src/mockData.ts', lines.join('\n'));

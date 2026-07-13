const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('/* DEFAULT EMPTY PANEL STATE */'));
if (idx > -1) {
  lines.splice(idx - 1, 0, '              </>', '            )}');
  fs.writeFileSync('src/components/DirectoryTab.tsx', lines.join('\n'));
}

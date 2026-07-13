const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('/* DEFAULT EMPTY PANEL STATE */'));
if (idx > -1) {
  // lines[idx] is /* DEFAULT ...
  // lines[idx - 1] is ) : (
  // lines[idx - 2] is </div>
  // lines[idx - 3] is </div>
  lines.splice(idx - 1, 0, '              </>', '            )}');
  fs.writeFileSync('src/components/DirectoryTab.tsx', lines.join('\n'));
}

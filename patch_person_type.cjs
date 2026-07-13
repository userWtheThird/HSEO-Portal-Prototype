const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/title\?: string;/g, "title?: string;\n  status?: 'Active' | 'Inactive';");
fs.writeFileSync('src/types.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/rectificationRecord\?: string;/, "rectificationRecord?: string;\n  photoUrl?: string;\n  followUpActions?: string;");
fs.writeFileSync('src/types.ts', code);

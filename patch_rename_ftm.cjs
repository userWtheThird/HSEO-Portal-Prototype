const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/FTM Management/, "Field Team Members");
fs.writeFileSync('src/App.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/export type Role = 'admin' \| 'inspector' \| 'radiation_officer' \| 'operator' \| 'facilities';/, "export type Role = 'admin' | 'inspector' | 'radiation_officer' | 'operator' | 'facilities' | 'PI' | 'Contact' | 'FTM';");
fs.writeFileSync('src/types.ts', code);

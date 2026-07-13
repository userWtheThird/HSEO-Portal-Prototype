const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

code = code.replace(/onAddPerson: \(pers: Person\) => void;\n\}/, "onAddPerson: (pers: Person) => void;\n  onUpdatePerson: (person: Person) => void;\n}");

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

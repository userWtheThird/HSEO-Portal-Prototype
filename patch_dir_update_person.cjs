const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

code = code.replace(/onAddPerson: \(person: Person\) => void;/, "onAddLocation: (loc: Location) => void;\n  onAddPerson: (person: Person) => void;\n  onUpdatePerson: (person: Person) => void;");
code = code.replace(/onAddPerson\n\}: DirectoryTabProps\) \{/, "onAddPerson,\n  onUpdatePerson\n}: DirectoryTabProps) {");

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

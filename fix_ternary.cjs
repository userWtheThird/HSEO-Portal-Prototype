const fs = require('fs');

function fixLocationTab() {
  let code = fs.readFileSync('src/components/LocationTab.tsx', 'utf-8');
  code = code.replace(/subTab === 'locations' \? "Search building, room, room nature, PI name\.\.\." : "Search name, title, department, role\.\.\."/, '"Search building, room, room nature, PI name..."');
  code = code.replace(/\{subTab === 'locations' \? \(/g, '{true ? (');
  fs.writeFileSync('src/components/LocationTab.tsx', code);
}

function fixDirectoryTab() {
  let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
  code = code.replace(/subTab === 'locations' \? "Search building, room, room nature, PI name\.\.\." : "Search name, title, department, role\.\.\."/, '"Search name, title, department, role..."');
  code = code.replace(/\{subTab === 'locations' \? \(/g, '{false ? (');
  fs.writeFileSync('src/components/DirectoryTab.tsx', code);
}

fixLocationTab();
fixDirectoryTab();

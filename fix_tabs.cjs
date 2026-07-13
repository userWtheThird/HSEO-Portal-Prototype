const fs = require('fs');

function fixLocationTab() {
  let code = fs.readFileSync('src/components/LocationTab.tsx', 'utf-8');
  // Remove the comparison checks. It uses `{subTab === 'locations' && (`
  // and `{subTab === 'persons' && (`
  code = code.replace(/\{subTab === 'locations' && \(/g, '{true && (');
  code = code.replace(/\{subTab === 'persons' && \([\s\S]*?\)\}\n\s*<\/div>/, ''); // Remove the persons block
  fs.writeFileSync('src/components/LocationTab.tsx', code);
}

function fixDirectoryTab() {
  let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
  // Remove the comparison checks. It uses `{subTab === 'locations' && (`
  // and `{subTab === 'persons' && (`
  code = code.replace(/\{subTab === 'persons' && \(/g, '{true && (');
  // The locations block comes first in the file
  // Let's just find {subTab === 'locations' && ( ... )} and remove it. 
  // It's a huge block. We can just replace it with an empty string.
  // A safer regex might be:
  const startIdx = code.indexOf("{subTab === 'locations' && (");
  if (startIdx !== -1) {
    const endIdx = code.indexOf("{subTab === 'persons' && (");
    if (endIdx !== -1) {
       code = code.substring(0, startIdx) + code.substring(endIdx);
    }
  }
  
  // also fix the true && ( if it's there
  code = code.replace(/\{subTab === 'persons' && \(/g, '{true && (');

  fs.writeFileSync('src/components/DirectoryTab.tsx', code);
}

fixLocationTab();
fixDirectoryTab();

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const search = `<InspectionTab 
              currentUser={currentUser}
              inspections={inspections}
              onAddInspection={handleAddInspection}
              onUpdateFindings={handleUpdateFindings}
            />`;

const replace = `<InspectionTab 
              currentUser={currentUser}
              inspections={inspections}
              locations={locations}
              persons={persons}
              onAddInspection={handleAddInspection}
              onUpdateFindings={handleUpdateFindings}
              onUpdateInspection={handleUpdateInspection}
            />`;

if (code.includes(search)) {
  fs.writeFileSync('src/App.tsx', code.replace(search, replace));
  console.log("Patched successfully");
} else {
  console.log("Could not find the target string. The actual text is:");
  const lines = code.split('\n');
  const index = lines.findIndex(l => l.includes('<InspectionTab'));
  if (index !== -1) {
    console.log(lines.slice(index, index + 10).join('\n'));
  }
}

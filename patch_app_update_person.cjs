const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// replace the DirectoryTab render to include onUpdatePerson
const oldRender = `          {activeTab === 'directory' && (
            <DirectoryTab 
              currentUser={currentUser}
              locations={locations}
              persons={persons}
              inspections={inspections}
              radiationSources={radiationSources}
              laserDevices={laserDevices}
              permits={permits}
              wasteRequests={wasteRequests}
              waterLogs={waterLogs}
              ieqLogs={ieqLogs}
              ieqComplaints={ieqComplaints}
              onAddLocation={handleAddLocation}
              onAddPerson={handleAddPerson}
            />
          )}`;

const newRender = `          {activeTab === 'directory' && (
            <DirectoryTab 
              currentUser={currentUser}
              locations={locations}
              persons={persons}
              inspections={inspections}
              radiationSources={radiationSources}
              laserDevices={laserDevices}
              permits={permits}
              wasteRequests={wasteRequests}
              waterLogs={waterLogs}
              ieqLogs={ieqLogs}
              ieqComplaints={ieqComplaints}
              onAddLocation={handleAddLocation}
              onAddPerson={handleAddPerson}
              onUpdatePerson={handleUpdatePerson}
            />
          )}`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('src/App.tsx', code);

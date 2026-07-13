const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import DirectoryTab from '\.\/components\/DirectoryTab';/, "import LocationTab from './components/LocationTab';\nimport DirectoryTab from './components/DirectoryTab';");

const newNav = `          <button 
            onClick={() => { setActiveTab('location'); setMobileMenuOpen(false); }}
            className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition \${
              activeTab === 'location' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }\`}
          >
            <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Locations</span>
          </button>

          <button 
            onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
            className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition \${
              activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }\`}
          >
            <Users className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Personnel Directory</span>
          </button>`;

code = code.replace(/<button \n            onClick=\{\(\) => \{ setActiveTab\('directory'\); setMobileMenuOpen\(false\); \}\}[\s\S]+?Locations & Directory<\/span>\n          <\/button>/, newNav);

const newRender = `          {activeTab === 'location' && (
            <LocationTab 
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
          )}

          {activeTab === 'directory' && (
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

code = code.replace(/\{activeTab === 'directory' && \([\s\S]+?onAddPerson=\{handleAddPerson\}\n            \/>\n          \)\}/, newRender);

fs.writeFileSync('src/App.tsx', code);

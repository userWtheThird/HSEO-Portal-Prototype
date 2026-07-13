const fs = require('fs');

function patchLocationTab() {
  let code = fs.readFileSync('src/components/LocationTab.tsx', 'utf-8');
  
  code = code.replace(/export default function DirectoryTab/, 'export default function LocationTab');
  code = code.replace(/const \[subTab, setSubTab\] = useState<'locations' \| 'persons'>\('locations'\);/, "const subTab = 'locations';");
  
  const searchUI = `            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Building className="h-5.5 w-5.5 text-indigo-500" />
              Locations & Persons Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cross-linked compliance framework. View spatial room configurations, assigned PIs, emergency contacts, and linked active safety programs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSubTab('locations');
                setSearchQuery('');
                setSelectedLocationId(null);
                setSelectedPersonId(null);
              }}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${
                subTab === 'locations' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }\`}
            >
              Locations List ({locations.length})
            </button>
            <button
              onClick={() => {
                setSubTab('persons');
                setSearchQuery('');
                setSelectedLocationId(null);
                setSelectedPersonId(null);
              }}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${
                subTab === 'persons' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }\`}
            >
              Persons Directory ({persons.length})
            </button>
          </div>`;

  const replaceUI = `            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="h-5.5 w-5.5 text-indigo-500" />
              Locations
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage facility locations, rooms, and registered workspaces.
            </p>
          </div>`;

  code = code.replace(searchUI, replaceUI);
  fs.writeFileSync('src/components/LocationTab.tsx', code);
}

function patchDirectoryTab() {
  let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');
  
  code = code.replace(/const \[subTab, setSubTab\] = useState<'locations' \| 'persons'>\('locations'\);/, "const subTab = 'persons';");
  
  const searchUI = `            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Building className="h-5.5 w-5.5 text-indigo-500" />
              Locations & Persons Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cross-linked compliance framework. View spatial room configurations, assigned PIs, emergency contacts, and linked active safety programs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSubTab('locations');
                setSearchQuery('');
                setSelectedLocationId(null);
                setSelectedPersonId(null);
              }}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${
                subTab === 'locations' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }\`}
            >
              Locations List ({locations.length})
            </button>
            <button
              onClick={() => {
                setSubTab('persons');
                setSearchQuery('');
                setSelectedLocationId(null);
                setSelectedPersonId(null);
              }}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${
                subTab === 'persons' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }\`}
            >
              Persons Directory ({persons.length})
            </button>
          </div>`;

  const replaceUI = `            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-500" />
              Personnel Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage personnel, roles, and department assignments.
            </p>
          </div>`;

  code = code.replace(searchUI, replaceUI);
  fs.writeFileSync('src/components/DirectoryTab.tsx', code);
}

patchLocationTab();
patchDirectoryTab();

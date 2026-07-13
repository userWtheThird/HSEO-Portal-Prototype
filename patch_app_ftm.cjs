const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importReplacement = `import DirectoryTab from './components/DirectoryTab';
import FtmTab from './components/FtmTab';`;
code = code.replace(/import DirectoryTab from '\.\/components\/DirectoryTab';/, importReplacement);

const newNavReplacement = `          <button 
            onClick={() => setActiveTab('directory')}
            className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-xs font-semibold \${activeTab === 'directory' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}\`}
          >
            <BookOpen className="h-4 w-4" /> Personnel & Assets
          </button>
          
          <button 
            onClick={() => setActiveTab('ftm')}
            className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-xs font-semibold \${activeTab === 'ftm' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}\`}
          >
            <ShieldCheck className="h-4 w-4" /> FTM Management
          </button>`;
code = code.replace(/<button \n            onClick=\{\(\) => setActiveTab\('directory'\)\}[\s\S]+?Personnel & Assets\n          <\/button>/, newNavReplacement);

const updatePersonFunc = `  const handleUpdatePerson = (updated: Person) => {
    const nextPersons = persons.map(p => p.id === updated.id ? updated : p);
    setPersons(nextPersons);
    saveState({ persons: nextPersons });
  };
`;
code = code.replace(/  \/\/ Directory Handlers/, updatePersonFunc + "\n  // Directory Handlers");

const ftmTabRender = `
          {activeTab === 'ftm' && (
            <FtmTab 
              persons={persons}
              locations={locations}
              onUpdatePerson={handleUpdatePerson}
            />
          )}
        </div>
`;
code = code.replace(/<\/div>\n\n      <\/main>/, ftmTabRender + "\n      </main>");

fs.writeFileSync('src/App.tsx', code);

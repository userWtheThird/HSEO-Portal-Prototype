const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `<button 
            onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
            className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition \${
              activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }\`}
          >
            <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Locations & Directory</span>
          </button>

          <button 
            onClick={() => { setActiveTab('ftm'); setMobileMenuOpen(false); }}
            className={\`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition \${
              activeTab === 'ftm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }\`}
          >
            <Users className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Field Team Members</span>
          </button>`;

code = code.replace(/<button \n            onClick=\{\(\) => \{ setActiveTab\('directory'\); setMobileMenuOpen\(false\); \}\}[\s\S]+?Locations & Directory<\/span>\n          <\/button>/, replacement);

fs.writeFileSync('src/App.tsx', code);

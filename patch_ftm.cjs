const fs = require('fs');
let code = fs.readFileSync('src/components/FtmTab.tsx', 'utf-8');
code = code.replace(/import \{ Shield, Building2, User, UserCheck \} from 'lucide-react';/, "import { Shield, Building2, User, UserCheck, X } from 'lucide-react';");
fs.writeFileSync('src/components/FtmTab.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');

const piUser = `  {
    id: 'user_pi_1',
    name: 'Dr. John Smith',
    email: 'john.smith@hseo-portal.net',
    role: 'PI',
    avatarColor: 'bg-cyan-600 text-white',
    title: 'Principal Investigator'
  },`;

code = code.replace(/export const SIMULATED_USERS: User\[\] = \[/, "export const SIMULATED_USERS: User[] = [\n" + piUser);
fs.writeFileSync('src/mockData.ts', code);

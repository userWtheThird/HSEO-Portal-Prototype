const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf-8');

const ftmUser = `  {
    id: 'user_ftm_1',
    name: 'FTM Person 1',
    email: 'ftm1@hseo-portal.net',
    role: 'FTM',
    avatarColor: 'bg-teal-600 text-white',
    title: 'Field Team Member'
  },`;

code = code.replace(/export const SIMULATED_USERS: User\[\] = \[/, "export const SIMULATED_USERS: User[] = [\n" + ftmUser);
fs.writeFileSync('src/mockData.ts', code);

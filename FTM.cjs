const fs = require('fs');

let mock = fs.readFileSync('src/mockData.ts', 'utf-8');

const ftms = [];
for (let i = 1; i <= 11; i++) {
  ftms.push(`  {
    id: 'pers_ftm_${i}',
    name: 'Field Team Member ${i}',
    role: 'Field Team Member',
    department: 'HSEO',
    assignedDepartments: ['Physics', 'Chemistry'],
    email: 'ftm${i}@hseo-portal.net',
    phone: '+1 (555) 000-00${i.toString().padStart(2, '0')}',
    title: 'Field Team Member ${i}'
  }`);
}

mock = mock.replace('export const SIMULATED_PERSONS: Person[] = [', 'export const SIMULATED_PERSONS: Person[] = [\n' + ftms.join(',\n') + ',');

fs.writeFileSync('src/mockData.ts', mock);

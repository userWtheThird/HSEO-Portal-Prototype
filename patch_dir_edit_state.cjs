const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const editStateLines = `  // Edit person form state
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [editPersName, setEditPersName] = useState('');
  const [editPersRole, setEditPersRole] = useState<'PI' | 'Staff' | 'Contact' | 'Officer' | 'FTM'>('Staff');
  const [editPersDept, setEditPersDept] = useState('');
  const [editPersEmail, setEditPersEmail] = useState('');
  const [editPersPhone, setEditPersPhone] = useState('');
  const [editPersTitle, setEditPersTitle] = useState('');
  const [editPersStatus, setEditPersStatus] = useState<'Active' | 'Inactive'>('Active');`;

code = code.replace(/\/\/ Handle Location submit/, editStateLines + '\n\n  // Handle Location submit');

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

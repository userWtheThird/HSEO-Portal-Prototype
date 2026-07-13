const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const submitFunc = `  const handleUpdatePersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) return;
    const selectedPers = persons.find(p => p.id === selectedPersonId);
    if (!selectedPers) return;
    
    if (!editPersName || !editPersDept) {
      alert("Please fill in required fields.");
      return;
    }
    const updated: Person = {
      ...selectedPers,
      name: editPersName,
      role: editPersRole,
      department: editPersDept,
      email: editPersEmail,
      phone: editPersPhone,
      title: editPersTitle,
      status: editPersStatus
    };
    onUpdatePerson(updated);
    setIsEditingPerson(false);
  };`;

code = code.replace(/\/\/ Handle Person submit/, submitFunc + '\n\n  // Handle Person submit');

fs.writeFileSync('src/components/DirectoryTab.tsx', code);

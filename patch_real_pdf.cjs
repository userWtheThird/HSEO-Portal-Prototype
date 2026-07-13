const fs = require('fs');
let code = fs.readFileSync('src/components/InspectionTab.tsx', 'utf-8');

const importReplacement = `import { ClipboardCheck, FileCheck, Search, Plus, Calendar, AlertTriangle, Check, X, ShieldCheck, Clock, User, ChevronRight, Download, Camera, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';`;

code = code.replace(/import \{ ClipboardCheck[^\n]+lucide-react';/, importReplacement);

const newPdfGen = `
  const handleDownloadReport = () => {
    if (!selectedInspection) return;
    
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text(\`INSPECTION REPORT: \${selectedInspection.title}\`, 14, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(\`Date: \${selectedInspection.date}\`, 14, y);
    y += 7;
    doc.text(\`Inspector: \${selectedInspection.inspectorName}\`, 14, y);
    y += 7;
    doc.text(\`Status: \${selectedInspection.inspectionStatus || selectedInspection.status}\`, 14, y);
    y += 15;
    
    doc.setFontSize(14);
    doc.text(\`FINDINGS:\`, 14, y);
    y += 10;
    
    doc.setFontSize(10);
    if (selectedInspection.findings.length === 0) {
      doc.text(\`No findings recorded.\`, 14, y);
    } else {
      selectedInspection.findings.forEach((f, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(\`\${idx + 1}. [Level \${f.actionLevel || 1}] - \${f.category.toUpperCase()}\`, 14, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        
        const splitDesc = doc.splitTextToSize(\`Description: \${f.description}\`, 180);
        doc.text(splitDesc, 14, y);
        y += splitDesc.length * 5;
        
        if (f.followUpActions) {
          const splitFollow = doc.splitTextToSize(\`Follow-up: \${f.followUpActions}\`, 180);
          doc.text(splitFollow, 14, y);
          y += splitFollow.length * 5;
        }
        
        if (f.photoUrl) {
          doc.text(\`Photo evidence attached.\`, 14, y);
          y += 6;
        }
        
        doc.text(\`Status: \${f.status}\`, 14, y);
        y += 6;
        
        if (f.status === 'resolved' && f.rectificationRecord) {
          const splitRec = doc.splitTextToSize(\`Rectification: \${f.rectificationRecord}\`, 180);
          doc.text(splitRec, 14, y);
          y += splitRec.length * 5;
        }
        
        y += 4;
      });
    }

    doc.save(\`Inspection_Report_\${selectedInspection.id}.pdf\`);
  };
`;

code = code.replace(/const handleDownloadReport = \(\) => \{[\s\S]+?URL\.revokeObjectURL\(url\);\n  \};/, newPdfGen);

fs.writeFileSync('src/components/InspectionTab.tsx', code);

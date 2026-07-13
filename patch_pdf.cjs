const fs = require('fs');
let code = fs.readFileSync('src/components/InspectionTab.tsx', 'utf-8');

const newPdfGen = `
    if (selectedInspection.findings.length === 0) {
      content += \`No findings recorded.\\n\`;
    } else {
      selectedInspection.findings.forEach((f, idx) => {
        content += \`\${idx + 1}. [Level \${f.actionLevel || 1}] - \${f.category.toUpperCase()}\\n\`;
        content += \`   Description: \${f.description}\\n\`;
        if (f.followUpActions) {
          content += \`   Follow-up: \${f.followUpActions}\\n\`;
        }
        if (f.photoUrl) {
          content += \`   Photo evidence attached.\\n\`;
        }
        content += \`   Status: \${f.status}\\n\`;
        if (f.status === 'resolved' && f.rectificationRecord) {
          content += \`   Rectification: \${f.rectificationRecord}\\n\`;
        }
        content += \`\\n\`;
      });
    }
`;

code = code.replace(/if \(selectedInspection\.findings\.length === 0\) \{[\s\S]+?\}\n\s+const blob/, newPdfGen + "\n    const blob");
fs.writeFileSync('src/components/InspectionTab.tsx', code);

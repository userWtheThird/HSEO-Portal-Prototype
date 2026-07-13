const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const lines = code.split('\n');

// Find the block around 1058
let targetLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(') : (') && lines[i].includes('/* DEFAULT EMPTY PANEL STATE */')) {
    targetLine = i;
    break;
  }
}

if (targetLine !== -1) {
  // We want to insert `</>)}` before the last `</div>` before `) : (`.
  // Actually, wait, let's just find the exact text and replace it.
  const oldText = `              </div>
            </div>
          ) : (
            /* DEFAULT EMPTY PANEL STATE */`;
  
  const newText = `              </div>
              </>
            )}
            </div>
          ) : (
            /* DEFAULT EMPTY PANEL STATE */`;
            
  if (code.includes(oldText)) {
    code = code.replace(oldText, newText);
    fs.writeFileSync('src/components/DirectoryTab.tsx', code);
    console.log("Replaced using text match.");
  } else {
    console.log("Could not find exact text match!");
  }
}


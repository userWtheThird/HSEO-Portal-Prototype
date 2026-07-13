const fs = require('fs');
let code = fs.readFileSync('src/components/DirectoryTab.tsx', 'utf-8');

const oldEnd = `                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DEFAULT EMPTY PANEL STATE */`;

const newEnd = `                  </div>
                </div>
              </div>
              </>
            )}
            </div>
          ) : (
            /* DEFAULT EMPTY PANEL STATE */`;

code = code.replace(oldEnd, newEnd);
fs.writeFileSync('src/components/DirectoryTab.tsx', code);

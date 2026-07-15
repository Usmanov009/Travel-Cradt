const fs = require('fs');
const path = 'C:/Users/user/Desktop/Travel-Cradt-main/src/app/pages/DashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');
const oldText = String.fromCharCode(123,98,111,111,107,105,110,103,46,112,114,105,99,101,67,117,114,114,101,110,99,121,32,61,61,61,32,39,85,90,83,39,32,63,32,96,36,123,98,111,111,107,105,110,103,46,112,114,105,99,101,46,116,111,76,111,99,97,108,101,83,116,114,105,110,103,40,41,125,32,115,111,39,109,96,32,58,32,96,36,123,98,111,111,107,105,110,103,46,112,114,105,99,101,46,116,111,76,111,99,97,108,101,83,116,114,105,110,103,40,41,125,96,125);
const newText = String.fromCharCode(123,98,111,111,107,105,110,103,46,112,114,105,99,101,67,117,114,114,101,110,99,121,32,61,61,61,32,39,85,90,83,39,32,63,32,96,36,123,98,111,111,107,105,110,103,46,112,114,105,99,101,46,116,111,76,111,99,97,108,101,83,116,114,105,110,103,40,41,125,32,115,111,39,109,96,32,58,32,96,36,36,123,98,111,111,107,105,110,103,46,112,114,105,99,101,46,116,111,76,111,99,97,108,101,83,116,114,105,110,103,40,41,125,96,125);
console.log('Match:', content.includes(oldText));
if (content.includes(oldText)) {
  console.log('FOUND! Replacing...');
  content = content.replace(oldText, newText);
  fs.writeFileSync(path, content, 'utf8');
  console.log('DONE');
} else {
  const idx = content.indexOf('priceCurrency');
  console.log('Context:', JSON.stringify(content.substring(idx, idx + 150)));
}
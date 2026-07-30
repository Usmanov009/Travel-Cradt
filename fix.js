const fs = require('fs');
const path = 'C:/Users/user/Desktop/Travel-Cradt-main/src/app/pages/DashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');
const oldText = '{booking.priceCurrency === 'UZS' ? `${booking.price.toLocaleString()} so'm` : `${booking.price.toLocaleString()}`}';
const newText = '{booking.priceCurrency === 'UZS' ? `${booking.price.toLocaleString()} so'm` : `$${booking.price.toLocaleString()}`}';
console.log('Match: ' + content.includes(oldText));
if (content.includes(oldText)) {
  console.log('FOUND! Replacing...');
  content = content.replace(oldText, newText);
  fs.writeFileSync(path, content, 'utf8');
  console.log('DONE');
} else {
  const idx = content.indexOf('priceCurrency');
  console.log('Context: ' + JSON.stringify(content.substring(idx, idx + 150)));
}
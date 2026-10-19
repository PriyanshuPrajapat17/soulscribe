const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        search(filePath);
      }
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('Got Questions') || content.includes('Coming Soon')) {
        console.log(`Found in: ${filePath}`);
      }
    }
  });
}

search('c:\\Users\\priya\\shopify internship');

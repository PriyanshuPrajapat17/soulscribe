const fs = require('fs');
const path = require('path');

function searchHtml(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchHtml(filePath);
    } else if (file.endsWith('.html')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('style=')) {
        console.log(`Inline style in: ${filePath}`);
        // print lines containing style=
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('style=')) {
            console.log(`  L${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

searchHtml(__dirname);

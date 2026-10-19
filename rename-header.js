const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  replacements.forEach(r => {
    if (content.includes(r.search)) {
      content = content.split(r.search).join(r.replace);
      modified = true;
    }
  });
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDir(filePath);
      }
    } else {
      if (file.endsWith('.html')) {
        replaceInFile(filePath, [
          { search: 'class="header"', replace: 'class="soulscribe-header"' },
          { search: 'class=\'header\'', replace: 'class=\'soulscribe-header\'' }
        ]);
      } else if (file === 'styles.css') {
        replaceInFile(filePath, [
          { search: '.header ', replace: '.soulscribe-header ' },
          { search: '.header{', replace: '.soulscribe-header{' },
          { search: '.header\n', replace: '.soulscribe-header\n' },
          { search: '.header,', replace: '.soulscribe-header,' },
          { search: 'header button[aria-label="Cart"]', replace: 'soulscribe-header button[aria-label="Cart"]' }
        ]);
      } else if (file === 'main.js') {
        replaceInFile(filePath, [
          { search: '.header button[aria-label="Cart"]', replace: '.soulscribe-header button[aria-label="Cart"]' }
        ]);
      }
    }
  });
}

processDir('c:\\Users\\priya\\shopify internship\\1st_project_4_6_26');
console.log("Renaming complete.");

const fs = require('fs');
const path = require('path');

const productDir = path.join(__dirname, 'product');
const files = fs.readdirSync(productDir);

const FILE_TO_HANDLE = {
  "heart-of-virtues.html": "heart-of-virtues-journaling-kit",
  "prayers-from-within.html": "prayers-from-within-journaling-kit",
  "thankyou-krishna.html": "thankyou-krishna-journaling-kit",
  "mercy-and-meltdowns.html": "mercy-and-meltdowns-journaling-kit",
  "108-days-with-krishna.html": "108-days-with-krishna-journaling-kit",
  "shravanam-to-smaranam.html": "shravanam-to-smaranam-journaling-kit",
  "daily-bliss-planner.html": "daily-bliss-planner",
  "morning-pages.html": "morning-pages",
  "gratitude-companion.html": "gratitude-companion",
  "soulful-saturdays.html": "soulful-saturdays",
  "reflect-and-rise.html": "reflect-and-rise",
  "pause-and-ponder.html": "pause-and-ponder"
};

files.forEach(file => {
  if (!file.endsWith('.html') || file === 'detail.html') return;

  const handle = FILE_TO_HANDLE[file];
  if (!handle) {
    console.log(`Skipping: ${file} (no handle mapped)`);
    return;
  }

  const filePath = path.join(productDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace <body> with <body data-shopify-handle="handle-name">
  // Handle both <body> and <body ...> cases if already modified
  if (content.includes('<body data-shopify-handle=')) {
    console.log(`Already modified: ${file}`);
    return;
  }

  content = content.replace('<body>', `<body data-shopify-handle="${handle}">`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully bound handle to: ${file}`);
});

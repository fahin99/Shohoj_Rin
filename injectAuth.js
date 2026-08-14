const fs = require('fs');
const path = require('path');

const files = [
  "admin/page.client.tsx",
  "applications/page.client.tsx",
  "apply/page.client.tsx",
  "dashboard/page.client.tsx",
  "lender/page.client.tsx",
  "loans/page.client.tsx",
  "my-loans/page.client.tsx",
  "onboarding/page.client.tsx",
  "repayment/page.client.tsx",
  "system-states/page.client.tsx"
];

// loans/details/page.client.tsx needs different relative path
const nestedFiles = [
  "loans/details/page.client.tsx"
];

const inject = (filePath, sessionPath) => {
  const fullPath = path.join('d:/Documents/Projects/ShohojRIn/apps/frontend/src/app', filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  if (content.includes('useRequireAuth')) return;

  // insert import after "use client";
  content = content.replace(/"use client";\r?\n/, `"use client";\n\nimport { useRequireAuth } from "${sessionPath}";\n`);
  
  // insert hook call inside export default function
  content = content.replace(/(export default function \w+\(\) {\r?\n)/, `$1  useRequireAuth();\n`);

  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
};

files.forEach(f => inject(f, '../../lib/session'));
nestedFiles.forEach(f => inject(f, '../../../lib/session'));

const fs = require('fs');

const files = [
  'apps/frontend/src/app/admin/page.tsx',
  'apps/frontend/src/app/applications/page.tsx',
  'apps/frontend/src/app/apply/page.tsx',
  'apps/frontend/src/app/auth/page.tsx',
  'apps/frontend/src/app/dashboard/page.tsx',
  'apps/frontend/src/app/lender/page.tsx',
  'apps/frontend/src/app/my-loans/page.tsx',
  'apps/frontend/src/app/onboarding/page.tsx',
  'apps/frontend/src/app/page.tsx',
  'apps/frontend/src/app/repayment/page.tsx',
  'apps/frontend/src/app/system-states/page.tsx',
  'apps/frontend/src/components/AppLayout.tsx',
  'apps/frontend/src/components/Footer.tsx',
  'apps/frontend/src/components/Logo.tsx',
  'apps/frontend/src/views/AuthPage.tsx',
  'apps/frontend/src/views/FinancialEducation.tsx',
  'apps/frontend/src/views/LandingPage.tsx',
  'apps/frontend/src/views/SystemStates.tsx',
  'apps/frontend/src/styles.css'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Shohoj<span style=\{\{ color: accentColor \}\}>_Rin<\/span>/g, 'Shohoj <span style={{ color: accentColor }}>Rin</span>');
    content = content.replace(/Shohoj_Rin/g, 'Shohoj Rin');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced in ${file}`);
  }
}

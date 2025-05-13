#!/bin/bash

echo "🚀 Setting up cd-shell project..."

mkdir -p app sys themes/default public src

# Theme default
cat <<EOF > themes/default/theme.json
{
  "name": "Default Theme",
  "colors": {
    "primary": "#1976d2",
    "secondary": "#eeeeee",
    "accent": "#ff4081",
    "background": "#ffffff",
    "text": "#000000"
  },
  "font": "Arial, sans-serif",
  "logo": "/themes/default/logo.png"
}
EOF

touch themes/default/logo.png

# Default index.html
cat <<EOF > public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Corpdesk Shell</title>
  <link rel="stylesheet" href="/index.css">
</head>
<body>
  <header id="cd-header">
    <img id="cd-logo" alt="Logo" />
    <span id="cd-app-name">Corpdesk Shell</span>
  </header>
  <div id="sidebar"></div>
  <main id="content"></main>

  <script type="module" src="/src/bootstrap.ts"></script>
</body>
</html>
EOF

# Basic TS bootstrap
cat <<EOF > src/bootstrap.ts
import { loadTheme } from './theme-loader.ts';

console.log('🔧 Bootstrapping cd-shell...');
loadTheme('default');
EOF

# Theme loader
cat <<EOF > src/theme-loader.ts
export async function loadTheme(themeId: string = 'default') {
  const res = await fetch(\`/themes/\${themeId}/theme.json\`);
  const theme = await res.json();

  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(\`--cd-\${key}-color\`, value);
  });

  document.body.style.fontFamily = theme.font || 'sans-serif';

  const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
  if (logoEl && theme.logo) {
    logoEl.src = theme.logo;
  }
}
EOF

echo "✅ cd-shell setup complete!"

#!/bin/bash

echo "🚀 Setting up PWA-OS directory structure..."

# Root level cleanup & structure
mkdir -p src/{bootstrap,config,menu,theme,utils}
mkdir -p src/plugins/{app,data,location,media,notifications,storage,system,ui}

# Move existing files into appropriate locations
echo "📦 Moving existing core files..."

[ -f src/bootstrap.ts ] && mv src/bootstrap.ts src/bootstrap/bootstrap.ts
[ -f src/theme-loader.ts ] && mv src/theme-loader.ts src/theme/theme-loader.ts

# Move menu-related components into new menu folder
if [ -d src/menu-manager ]; then
  mv src/menu-manager/* src/menu/
  rm -rf src/menu-manager
fi

# Move theme-related components into new theme folder
if [ -d src/theme-manager ]; then
  mv src/theme-manager/* src/theme/
  rm -rf src/theme-manager
fi

# Move menu renderer into new runtime location under menu
if [ -f src/runtime/menuRenderer.ts ]; then
  mv src/runtime/menuRenderer.ts src/menu/menuRenderer.ts
  rm -rf src/runtime
fi

# Create placeholder files
touch src/config/shell.config.ts
touch src/menu/menuTypes.ts
touch src/theme/themeTypes.ts
touch src/bootstrap/moduleManager.ts
touch src/bootstrap/loader.ts
touch src/index.ts

# Create utils placeholder
touch src/utils/logger.ts
touch src/utils/helpers.ts

# Message on complete
echo "✅ PWA-OS folder setup complete!"

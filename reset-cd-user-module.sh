#!/bin/bash

set -e

ROOT_DIR=$(pwd)
MODULE_DIR="$ROOT_DIR/src/modules/sys/cd-user"
BACKUP_DIR="$MODULE_DIR.bu"

echo "[INFO] Checking for existing cd-user module..."

# Backup existing module if present
if [ -d "$MODULE_DIR" ]; then
  echo "[INFO] Found existing module at $MODULE_DIR"
  echo "[INFO] Backing up to $BACKUP_DIR"

  # Remove old backup if exists
  if [ -d "$BACKUP_DIR" ]; then
    rm -rf "$BACKUP_DIR"
  fi

  mv "$MODULE_DIR" "$BACKUP_DIR"
fi

echo "[INFO] Creating new cd-user module structure..."

mkdir -p "$MODULE_DIR"

# index.js
cat <<EOF > "$MODULE_DIR/index.js"
import { ctlSignIn } from './sign-in.controller.js';
import { ctlSignUp } from './sign-up.controller.js';

export const cdUserModule = {
  ctx: 'sys',
  moduleId: 'cd-user',
  moduleName: 'User Management',
  moduleGuid: 'user-guid-123',
  template: ctlSignIn.template(),
  menu: [
    {
      label: 'User',
      route: 'sys/cd-user',
      children: [
        { label: 'Sign In', route: 'sys/cd-user/sign-in', template: ctlSignIn.template() },
        { label: 'Sign Up', route: 'sys/cd-user/sign-up', template: ctlSignUp.template() }
      ]
    }
  ]
};

export const module = cdUserModule;
EOF

# sign-in.controller.js
cat <<EOF > "$MODULE_DIR/sign-in.controller.js"
export const ctlSignIn = {
  template() {
    return '<div><h1>Sign In</h1><script>console.log("SignIn Loaded")</script></div>';
  }
};
EOF

# sign-up.controller.js
cat <<EOF > "$MODULE_DIR/sign-up.controller.js"
export const ctlSignUp = {
  template() {
    return '<div><h1>Sign Up</h1><script>console.log("SignUp Loaded")</script></div>';
  }
};
EOF

# index.d.ts
cat <<EOF > "$MODULE_DIR/index.d.ts"
import { ICdModule } from '../../types';

export declare const cdUserModule: ICdModule;
export declare const module: ICdModule;
EOF

# template.html
cat <<EOF > "$MODULE_DIR/template.html"
<div>
  <h1>Sign In</h1>
  <script>console.log("SignIn Loaded")</script>
</div>
EOF

# module.json
cat <<EOF > "$MODULE_DIR/module.json"
{
  "moduleId": "cd-user",
  "moduleName": "User Management",
  "moduleGuid": "user-guid-123",
  "ctx": "sys",
  "version": "1.0.0"
}
EOF

echo "[SUCCESS] New cd-user module structure created at $MODULE_DIR"

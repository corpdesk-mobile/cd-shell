#!/bin/bash

# Create base directories
mkdir -p sys/cd-user/controllers

# Create dummy SignInController
cat <<EOL > sys/cd-user/controllers/sign-in.controller.js
export class SignInController {
  template() {
    return \`
      <div>
        <h2>Sign In</h2>
        <button onclick="alert('Signing in...')">Sign In</button>
      </div>
    \`;
  }
}
EOL

# Create dummy SignUpController
cat <<EOL > sys/cd-user/controllers/sign-up.controller.js
export class SignUpController {
  template() {
    return \`
      <div>
        <h2>Sign Up</h2>
        <button onclick="alert('Signing up...')">Sign Up</button>
      </div>
    \`;
  }
}
EOL

# Create index.js for cd-user module
cat <<EOL > sys/cd-user/index.js
import { SignInController } from './controllers/sign-in.controller.js';
import { SignUpController } from './controllers/sign-up.controller.js';

const ctlSignIn = new SignInController();
const ctlSignUp = new SignUpController();

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
EOL

echo "✅ Dummy cd-user module created at sys/cd-user/"

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

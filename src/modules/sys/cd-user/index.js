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

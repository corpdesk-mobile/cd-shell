import { ctlSignIn } from "./sign-in.controller.js";
import { ctlSignUp } from "./sign-up.controller.js";

export const cdUserModule = {
  ctx: "sys",
  moduleId: "cd-user",
  moduleName: "User Management",
  moduleGuid: "user-guid-123",
  template: ctlSignIn.__template(),
  menu: [
    {
      label: "User",
      route: "#",
      icon: {
        icon: "fa-solid fa-user",
        iconType: "fontawesome",
        iconSize: 16,
        iconColor: "#1976d2",
      },
      children: [
        {
          label: "Sign In",
          itemType: "template",
          route: "#",
          icon: {
            icon: "fa-solid fa-right-to-bracket",
            iconType: "fontawesome",
            iconColor: "#444",
          },
          template: ctlSignIn.__template(),
          controller: ctlSignIn,
        },
        {
          label: "Sign Up",
          itemType: "template",
          route: "#",
          icon: {
            icon: "fa-solid fa-user-plus",
            iconType: "fontawesome",
            iconColor: "#444",
          },
          template: ctlSignUp.__template(),
          controller: ctlSignUp,
        },
      ],
    },
  ],
};

export const module = cdUserModule;

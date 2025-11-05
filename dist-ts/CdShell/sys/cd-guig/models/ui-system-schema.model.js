// import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-concept-descriptor.model";
// --- NEW: Static array for manual registration fallback ---
// export const STATIC_UI_SYSTEM_REGISTRY: UiSystemDescriptor[] = [
//   {
//     id: "bootstrap-5",
//     name: "Bootstrap 5",
//     description: "Modern, mobile-first design system.",
//     version: "5.3.0",
//     scripts: [], // Add core scripts if needed
//     themesAvailable: [
//       {
//         id: "default",
//         name: "Default Light",
//         isDefault: true,
//         stylesheets: ["/assets/themes/bs5/default.css"],
//       },
//       {
//         id: "dark",
//         name: "Dark Mode",
//         isDefault: false,
//         stylesheets: ["/assets/themes/bs5/dark.css"],
//       },
//     ],
//     // The default system is the active one for activation.
//     themeActive: {
//       id: "default",
//       name: "Default Light",
//       stylesheets: ["/assets/themes/bs5/default.css"],
//     },
//   },
//   {
//     id: "corpdesk-ui",
//     name: "Corpdesk UI (WIP)",
//     description: "Custom Corpdesk component library.",
//     version: "1.0.0",
//     scripts: [],
//     themesAvailable: [
//       {
//         id: "corp-default",
//         name: "Corpdesk Default",
//         isDefault: true,
//         stylesheets: ["/assets/themes/corp/default.css"],
//       },
//     ],
//     themeActive: {
//       id: "corp-default",
//       name: "Corpdesk Default",
//       stylesheets: ["/assets/themes/corp/default.css"],
//     },
//   },
// ];
export const STATIC_UI_SYSTEM_REGISTRY = [
    {
        id: "bootstrap-5",
        name: "Bootstrap 5",
        scripts: ["/assets/ui-systems/bootstrap-5/bootstrap.min.js"],
        themesAvailable: [
            {
                id: "default",
                name: "Default Light",
                isDefault: true,
                stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"],
            },
        ],
        themeActive: {
            id: "default",
            name: "Default Light",
            stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"],
        },
    },
    {
        id: "material-design",
        name: "Material Design",
        scripts: ["/assets/ui-systems/material-design/material-components-web.min.js"],
        themesAvailable: [
            {
                id: "default",
                name: "Material Default",
                isDefault: true,
                stylesheets: ["/assets/ui-systems/material-design/material-components-web.min.css"],
            },
        ],
        themeActive: {
            id: "default",
            name: "Material Default",
            stylesheets: ["/assets/ui-systems/material-design/material-components-web.min.css"],
        },
    },
];

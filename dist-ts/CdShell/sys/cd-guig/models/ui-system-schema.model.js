// import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-concept-descriptor.model";
// --- NEW: Static array for manual registration fallback ---
export const STATIC_UI_SYSTEM_REGISTRY = [
    //
    // ──────────────────────────────────────────────────────────
    //  Bootstrap 5.0.2 (legacy)
    // ──────────────────────────────────────────────────────────
    //
    {
        id: "bootstrap-502",
        name: "Bootstrap 5.0.2",
        version: "5.0.2",
        cssUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.css",
        jsUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.js",
        scripts: ["/assets/ui-systems/bootstrap-502/bootstrap.min.js"],
        stylesheets: ["/assets/ui-systems/bootstrap-502/bootstrap.min.css"],
        themesAvailable: [
            {
                id: "default",
                name: "Default Light",
                isDefault: true,
                stylesheets: ["/assets/ui-systems/bootstrap-502/bootstrap.min.css"],
            },
        ],
        themeActive: "default",
    },
    //
    // ──────────────────────────────────────────────────────────
    //  Bootstrap 5.3.8 (NEW)
    // ──────────────────────────────────────────────────────────
    //
    {
        id: "bootstrap-538",
        name: "Bootstrap 5.3.8",
        version: "5.3.8",
        cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css",
        jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js",
        scripts: ["/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js"],
        stylesheets: ["/assets/ui-systems/bootstrap-538/bootstrap.min.css"],
        themesAvailable: [
            {
                id: "default",
                name: "Bootstrap 5.3 Default",
                isDefault: true,
                stylesheets: ["/assets/ui-systems/bootstrap-538/bootstrap.min.css"],
            },
        ],
        themeActive: "default",
    },
    //
    // ──────────────────────────────────────────────────────────
    //  Material Design
    // ──────────────────────────────────────────────────────────
    //
    {
        id: "material-design",
        name: "Material Design",
        cssUrl: "/assets/ui-systems/material-design/material-components-web.min.css",
        jsUrl: "/assets/ui-systems/material-design/material-components-web.min.js",
        scripts: [
            "/assets/ui-systems/material-design/material-components-web.min.js",
        ],
        stylesheets: [
            "/assets/ui-systems/material-design/material-components-web.min.css",
        ],
        themesAvailable: [
            {
                id: "default",
                name: "Material Default",
                isDefault: true,
                stylesheets: [
                    "/assets/ui-systems/material-design/material-components-web.min.css",
                ],
            },
        ],
        themeActive: "default",
    },
];

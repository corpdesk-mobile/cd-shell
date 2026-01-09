import { BaseUiAdapter } from "../services/base-ui-adapter.service";
/**
 * 2. Harmonized DEFAULT_SYSTEM
 * Ensure no trailing commas or hidden characters are present.
 */
export const DEFAULT_SYSTEM = {
    id: "bootstrap-538",
    version: "5.3.8",
    themeActive: "light",
};
/**
 * Defines the high-level role of a descriptor
 */
export var CdUiRole;
(function (CdUiRole) {
    CdUiRole["LAYOUT"] = "layout";
    CdUiRole["CONTAINER"] = "container";
    CdUiRole["CONTROL"] = "control";
    CdUiRole["COMPOSITE"] = "composite";
})(CdUiRole || (CdUiRole = {}));
export var CdUiLayoutType;
(function (CdUiLayoutType) {
    CdUiLayoutType["GRID"] = "grid";
    CdUiLayoutType["FLEX"] = "flex";
    CdUiLayoutType["STACK"] = "stack";
    CdUiLayoutType["MASONRY"] = "masonry";
})(CdUiLayoutType || (CdUiLayoutType = {}));
/** * Strict catalog of structural containers
 */
export var CdUiContainerType;
(function (CdUiContainerType) {
    CdUiContainerType["TABS"] = "tabs";
    CdUiContainerType["TAB"] = "tab";
    CdUiContainerType["CARD"] = "card";
    CdUiContainerType["ACCORDION"] = "accordion";
    CdUiContainerType["SECTION"] = "section";
    CdUiContainerType["DIALOG"] = "dialog";
})(CdUiContainerType || (CdUiContainerType = {}));
/** * Strict catalog of atomic controls
 */
export var CdUiControlType;
(function (CdUiControlType) {
    CdUiControlType["BUTTON"] = "button";
    CdUiControlType["TEXT_FIELD"] = "textField";
    CdUiControlType["CHECKBOX"] = "checkbox";
    CdUiControlType["SELECT"] = "select";
    CdUiControlType["SWITCH"] = "switch";
})(CdUiControlType || (CdUiControlType = {}));
export function isContainerDescriptor(d) {
    return d.role === CdUiRole.CONTAINER;
}
export function isTabDescriptor(d) {
    return (d.role === CdUiRole.CONTAINER &&
        d.containerType === CdUiContainerType.TAB);
}
export var UiAdapterCapability;
(function (UiAdapterCapability) {
    UiAdapterCapability["LAYOUT"] = "layout";
    UiAdapterCapability["CONTAINER"] = "container";
    UiAdapterCapability["CONTROL"] = "control";
})(UiAdapterCapability || (UiAdapterCapability = {}));
export var UiAdapterStatus;
(function (UiAdapterStatus) {
    UiAdapterStatus["ACTIVE"] = "ACTIVE";
    UiAdapterStatus["MARKED_FOR_DEPRECATION"] = "MARKED_FOR_DEPRECATION";
    UiAdapterStatus["LEGACY"] = "LEGACY";
})(UiAdapterStatus || (UiAdapterStatus = {}));
export function isUiAdapterConstructor(value) {
    return (typeof value === "function" &&
        value.prototype instanceof BaseUiAdapter);
}

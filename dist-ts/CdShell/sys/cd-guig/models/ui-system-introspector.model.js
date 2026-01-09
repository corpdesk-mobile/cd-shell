// legacy / shell-level lifecycle
export var UiAdapterPhase;
(function (UiAdapterPhase) {
    UiAdapterPhase["INIT"] = "init";
    UiAdapterPhase["SHELL_READY"] = "shell_ready";
    UiAdapterPhase["MENU_READY"] = "menu_ready";
    UiAdapterPhase["CONTROLLER_READY"] = "controller_ready";
    UiAdapterPhase["DOM_STABLE"] = "dom_stable";
})(UiAdapterPhase || (UiAdapterPhase = {}));
// adapter-internal lifecycle
export var UiAdapterLifecycle;
(function (UiAdapterLifecycle) {
    UiAdapterLifecycle["CREATED"] = "created";
    UiAdapterLifecycle["INITIALIZED"] = "initialized";
    UiAdapterLifecycle["ACTIVATED"] = "activated";
    UiAdapterLifecycle["MAPPED"] = "mapped";
    UiAdapterLifecycle["OBSERVING"] = "observing";
    UiAdapterLifecycle["THEMED"] = "themed";
})(UiAdapterLifecycle || (UiAdapterLifecycle = {}));
export const ShellToLifecycleHint = {
    [UiAdapterPhase.INIT]: UiAdapterLifecycle.CREATED,
    [UiAdapterPhase.SHELL_READY]: UiAdapterLifecycle.ACTIVATED,
    [UiAdapterPhase.DOM_STABLE]: UiAdapterLifecycle.OBSERVING,
};
export const UI_ADAPTER_LIFECYCLE_ORDER = [
    UiAdapterLifecycle.CREATED,
    UiAdapterLifecycle.INITIALIZED,
    UiAdapterLifecycle.ACTIVATED,
    UiAdapterLifecycle.MAPPED,
    UiAdapterLifecycle.OBSERVING,
    UiAdapterLifecycle.THEMED,
];

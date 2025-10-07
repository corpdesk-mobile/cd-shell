import { CdFxStateLevel } from "./i-base.js";
// Overloads for direct state checks
export function isSuccess(state) {
    return state === true || state === CdFxStateLevel.Success;
}
export function isPartialSuccess(state) {
    return state === CdFxStateLevel.PartialSuccess;
}
export function isLogicalFailure(state) {
    return state === CdFxStateLevel.LogicalFailure;
}
export function isWarning(state) {
    return state === CdFxStateLevel.Warning;
}
export function isRecoverable(state) {
    return state === CdFxStateLevel.Recoverable;
}
export function isInfo(state) {
    return state === CdFxStateLevel.Info;
}
export function isPending(state) {
    return state === CdFxStateLevel.Pending;
}
export function isCancelled(state) {
    return state === CdFxStateLevel.Cancelled;
}
export function isNotFound(state) {
    return state === CdFxStateLevel.NotFound;
}
export function isNotImplemented(state) {
    return state === CdFxStateLevel.NotImplemented;
}
export function isSystemError(state) {
    return state === CdFxStateLevel.SystemError;
}
export function isFatal(state) {
    return state === CdFxStateLevel.Fatal;
}
export function isUnknown(state) {
    return state === CdFxStateLevel.Unknown;
}
export function isFailure(state) {
    return (state === false || state === CdFxStateLevel.Fatal || isRecoverable(state));
}
export function getStateLevel(state) {
    if (state === true)
        return CdFxStateLevel.Success;
    if (state === false)
        return CdFxStateLevel.Fatal;
    return state;
}
export function interpretFxState(state, semantics) {
    if (typeof state === 'boolean') {
        return state ? semantics.mapping['Success'] : semantics.mapping['Error'];
    }
    return semantics.mapping[CdFxStateLevel[state]];
}

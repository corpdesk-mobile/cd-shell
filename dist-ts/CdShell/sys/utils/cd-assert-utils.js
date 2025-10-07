// cd-assert-utils.ts
import { CdFxStateLevel } from "../base/i-base.js";
// ─── Assertion Evaluator ──────────────────────────
export function isAssertSuccessful(result) {
    return result.data === true &&
        [CdFxStateLevel.Success, CdFxStateLevel.PartialSuccess].includes(result.state);
}
// ─── Type Guard ───────────────────────────────────
export function isCdFxReturnBoolean(obj) {
    return obj && typeof obj === 'object' &&
        typeof obj.data === 'boolean' &&
        typeof obj.state !== 'undefined';
}
// ─── Assertion Runner Utility ─────────────────────
export async function runAssert(fn) {
    const result = await fn();
    if (!isCdFxReturnBoolean(result)) {
        throw new Error('Invalid assertion result format.');
    }
    return isAssertSuccessful(result);
}

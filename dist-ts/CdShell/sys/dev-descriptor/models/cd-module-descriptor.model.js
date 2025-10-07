/**
 * Coprpdesk module are categorized by their context.
 * - CdCtx.Sys: System modules that are essential for the core functionality of Corpdesk.
 * - CdCtx.App: Optional modules that can be added to enhance or extend the capabilities of Corpdesk.
 *
 * This enum helps in identifying the context of a module and applying appropriate configurations or operations based on its type.
 */
export var CdCtx;
(function (CdCtx) {
    CdCtx["Sys"] = "sys";
    CdCtx["App"] = "app";
})(CdCtx || (CdCtx = {}));
/**
 * When performing automated operations, some configurations may be exempt from certain checks or validations.
 * This mapping defines which configurations are exempt based on the context.
 * - CdCtx.Sys: Exempt configurations for system-level operations.
 * - CdCtx.App: Exempt configurations for application-level operations.
 *
 * Each context maps to an array of configuration names that are exempt.
 * This allows for flexibility in handling different contexts while maintaining a clear structure.
 */
export const deriveExemptConfig = {
    [CdCtx.Sys]: ['base'],
    [CdCtx.App]: ['app-config'],
};

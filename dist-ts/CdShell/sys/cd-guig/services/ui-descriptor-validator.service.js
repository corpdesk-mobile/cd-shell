import { CdUiRole } from "../models/ui-system-adaptor.model";
export class UiDescriptorValidatorService {
    /* ---------- PUBLIC API ---------- */
    validate(root, adapter) {
        const errors = [];
        const warnings = [];
        const walk = (node, path) => {
            const currentPath = `${path}/${node.id}`;
            switch (node.role) {
                case CdUiRole.LAYOUT:
                    if (this.isLayout(node) &&
                        !adapter.getCapabilities().layouts.includes(node.layoutType)) {
                        errors.push(`Unsupported layout '${node.layoutType}' at ${currentPath}`);
                    }
                    break;
                case CdUiRole.CONTAINER:
                    if (this.isContainer(node) &&
                        !adapter.getCapabilities().containers.includes(node.containerType)) {
                        errors.push(`Unsupported container '${node.containerType}' at ${currentPath}`);
                    }
                    break;
                case CdUiRole.CONTROL:
                    if (this.isControl(node) &&
                        // !adapter.supportsControl(node.controlType)
                        !adapter.getCapabilities().controls.includes(node.controlType)) {
                        errors.push(`Unsupported control '${node.controlType}' at ${currentPath}`);
                    }
                    if (this.isControl(node) && !node.action) {
                        warnings.push(`Control '${node.id}' at ${currentPath} has no action`);
                    }
                    break;
            }
            node.children?.forEach((child) => walk(child, currentPath));
        };
        walk(root, "");
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /* ---------- TYPE GUARDS (PRIVATE) ---------- */
    isLayout(d) {
        return d.role === CdUiRole.LAYOUT;
    }
    isContainer(d) {
        return d.role === CdUiRole.CONTAINER;
    }
    isControl(d) {
        return d.role === CdUiRole.CONTROL;
    }
}

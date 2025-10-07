import { ComponentType } from "../dev-descriptor/models/component-descriptor.model.js";
export function isModelComponent(type) {
    return [
        ComponentType.Model,
        ComponentType.ModelType,
        ComponentType.ModelView,
    ].includes(type);
}

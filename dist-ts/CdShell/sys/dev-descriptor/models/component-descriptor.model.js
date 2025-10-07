// Discriminated Component Types
export var ComponentType;
(function (ComponentType) {
    ComponentType["Controller"] = "controller";
    ComponentType["ControllerType"] = "controller-type";
    ComponentType["Service"] = "service";
    ComponentType["ServiceType"] = "service-type";
    ComponentType["Model"] = "model";
    ComponentType["ModelType"] = "model-type";
    ComponentType["ModelView"] = "model-view";
    ComponentType["Utility"] = "utility";
    ComponentType["Component"] = "component";
    ComponentType["Plugin"] = "plugin";
})(ComponentType || (ComponentType = {}));

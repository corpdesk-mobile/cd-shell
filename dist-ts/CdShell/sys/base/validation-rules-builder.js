// import { ValidationRules } from "./i-base";
export class ValidationRulesBuilder {
    rules = {};
    existenceMap = {};
    require(...fields) {
        this.rules.required = [...(this.rules.required || []), ...fields];
        return this;
    }
    noDuplicate(...fields) {
        this.rules.noDuplicate = [...(this.rules.noDuplicate || []), ...fields];
        return this;
    }
    allowedValues(field, values) {
        this.rules.allowedValues = {
            ...(this.rules.allowedValues || {}),
            [field]: values,
        };
        return this;
    }
    minLength(field, length) {
        this.rules.minLength = { ...(this.rules.minLength || {}), [field]: length };
        return this;
    }
    maxLength(field, length) {
        this.rules.maxLength = { ...(this.rules.maxLength || {}), [field]: length };
        return this;
    }
    regex(field, pattern) {
        this.rules.regex = { ...(this.rules.regex || {}), [field]: pattern };
        return this;
    }
    mustExist(field, model) {
        this.existenceMap[field] = model;
        return this;
    }
    build() {
        return {
            rules: this.rules,
            existenceMap: this.existenceMap,
        };
    }
}

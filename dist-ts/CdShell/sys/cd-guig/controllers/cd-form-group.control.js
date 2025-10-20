// import { CdFormControl } from "./cd-form.control";
export class CdFormGroup {
    constructor(controls) {
        this.valid = true;
        this.controls = controls;
    }
    get value() {
        const result = {};
        for (const [key, control] of Object.entries(this.controls)) {
            result[key] = control.value;
        }
        return result;
    }
    validateAll() {
        const result = {};
        this.valid = true;
        for (const [key, control] of Object.entries(this.controls)) {
            const error = control.validate();
            result[key] = error;
            if (error)
                this.valid = false;
        }
        return result;
    }
    markAllAsTouched() {
        for (const control of Object.values(this.controls)) {
            control.markAsTouched();
        }
    }
    reset() {
        for (const control of Object.values(this.controls)) {
            control.reset();
        }
    }
}

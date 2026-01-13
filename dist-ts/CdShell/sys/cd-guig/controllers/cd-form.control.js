export class CdFormControl {
    constructor(value = null, validators = []) {
        this._errors = [];
        this.touched = false;
        this.dirty = false;
        this._value = value;
        this._validators = validators;
    }
    get value() {
        return this._value;
    }
    get valid() {
        return this._errors.length === 0;
    }
    get errors() {
        return this._errors;
    }
    get error() {
        return this._errors.length > 0 ? this._errors[0] : null;
    }
    setValue(value) {
        if (this._value !== value) {
            this._value = value;
            this.dirty = true;
        }
        this.validate();
    }
    markAsTouched() {
        this.touched = true;
    }
    validate() {
        this._errors = [];
        for (const validator of this._validators) {
            const result = validator(this._value);
            if (result)
                this._errors.push(result);
        }
        return this.error;
    }
    reset(value = null) {
        this._value = value;
        this._errors = [];
        this.touched = false;
        this.dirty = false;
    }
}

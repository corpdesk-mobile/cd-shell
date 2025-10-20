export class CdValidators {
    static required(message) {
        return (value) => {
            return value === null || value === undefined || value === ""
                ? message || "This field is required"
                : null;
        };
    }
    static minLength(length, message) {
        return (value) => {
            return value && value.length < length
                ? message || `Minimum length is ${length}`
                : null;
        };
    }
    static email(message) {
        return (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? null
                : message || "Invalid email address";
        };
    }
}

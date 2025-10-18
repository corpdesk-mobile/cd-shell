// src/CdShell/sys/utils/buffer-shim.ts
export class Buffer {
    constructor(data) {
        if (typeof data === 'number') {
            this.data = new Uint8Array(data);
        }
        else {
            this.data = new Uint8Array(data);
        }
    }
    static from(data, encoding) {
        if (typeof data === 'string') {
            const encoder = new TextEncoder();
            return new Buffer(encoder.encode(data));
        }
        else if (data instanceof ArrayBuffer) {
            return new Buffer(data);
        }
        else if (Array.isArray(data)) {
            return new Buffer(new Uint8Array(data));
        }
        else if (data?.buffer instanceof ArrayBuffer) {
            return new Buffer(data.buffer);
        }
        return new Buffer(new Uint8Array(0));
    }
    static alloc(size, fill, encoding) {
        const buffer = new Buffer(size);
        if (fill !== undefined) {
            if (typeof fill === 'string') {
                const encoder = new TextEncoder();
                const fillBytes = encoder.encode(fill);
                for (let i = 0; i < size; i++) {
                    buffer.data[i] = fillBytes[i % fillBytes.length];
                }
            }
            else {
                buffer.data.fill(fill);
            }
        }
        return buffer;
    }
    static allocUnsafe(size) {
        return new Buffer(size);
    }
    static allocUnsafeSlow(size) {
        return new Buffer(size);
    }
    static isBuffer(obj) {
        return obj instanceof Buffer;
    }
    static byteLength(string, encoding) {
        const encoder = new TextEncoder();
        return encoder.encode(string).length;
    }
    static compare(buf1, buf2) {
        // Simple comparison implementation
        const a = buf1.data;
        const b = buf2.data;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i])
                return a[i] - b[i];
        }
        return a.length - b.length;
    }
    static concat(buffers, totalLength) {
        const length = totalLength || buffers.reduce((sum, buf) => sum + buf.length, 0);
        const result = Buffer.alloc(length);
        let offset = 0;
        for (const buffer of buffers) {
            result.data.set(buffer.data, offset);
            offset += buffer.length;
        }
        return result;
    }
    // Instance methods
    toString(encoding = 'utf8', start, end) {
        const slice = this.data.subarray(start, end);
        const decoder = new TextDecoder();
        return decoder.decode(slice);
    }
    equals(other) {
        if (this.length !== other.length)
            return false;
        for (let i = 0; i < this.length; i++) {
            if (this.data[i] !== other.data[i])
                return false;
        }
        return true;
    }
    compare(other, targetStart, targetEnd, sourceStart, sourceEnd) {
        return Buffer.compare(this, other);
    }
    copy(target, targetStart, sourceStart, sourceEnd) {
        const start = sourceStart || 0;
        const end = sourceEnd || this.length;
        const targetIdx = targetStart || 0;
        const length = Math.min(end - start, target.length - targetIdx);
        target.data.set(this.data.subarray(start, start + length), targetIdx);
        return length;
    }
    slice(start, end) {
        return new Buffer(this.data.subarray(start, end));
    }
    subarray(start, end) {
        return this.slice(start, end);
    }
    write(string, offset, length, encoding) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(string);
        const start = offset || 0;
        const writeLength = length || encoded.length;
        this.data.set(encoded.subarray(0, writeLength), start);
        return Math.min(writeLength, encoded.length);
    }
    writeUInt8(value, offset) {
        this.data[offset] = value & 0xFF;
        return offset + 1;
    }
    writeUInt16LE(value, offset) {
        this.data[offset] = value & 0xFF;
        this.data[offset + 1] = (value >>> 8) & 0xFF;
        return offset + 2;
    }
    writeUInt32LE(value, offset) {
        this.data[offset] = value & 0xFF;
        this.data[offset + 1] = (value >>> 8) & 0xFF;
        this.data[offset + 2] = (value >>> 16) & 0xFF;
        this.data[offset + 3] = (value >>> 24) & 0xFF;
        return offset + 4;
    }
    readUInt8(offset) {
        return this.data[offset];
    }
    readUInt16LE(offset) {
        return this.data[offset] + (this.data[offset + 1] << 8);
    }
    readUInt32LE(offset) {
        return (this.data[offset] +
            (this.data[offset + 1] << 8) +
            (this.data[offset + 2] << 16) +
            (this.data[offset + 3] << 24));
    }
    // Property accessors to mimic Uint8Array
    get length() {
        return this.data.length;
    }
    // Iterator support
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
    }
    entries() {
        return this.data.entries();
    }
    keys() {
        return this.data.keys();
    }
    values() {
        return this.data.values();
    }
}
// Add index signature support
Object.defineProperty(Buffer.prototype, 'length', {
    get: function () { return this.data.length; }
});
// Proxy index access to underlying Uint8Array
const handler = {
    get(target, prop) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            return target.data[Number(prop)];
        }
        return target[prop];
    },
    set(target, prop, value) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
            target.data[Number(prop)] = value;
            return true;
        }
        target[prop] = value;
        return true;
    }
};
// Create a proxy wrapper function
export const createBuffer = (data) => {
    return new Proxy(new Buffer(data), handler);
};
// Default export maintains API compatibility
export default Buffer;

// src/CdShell/sys/utils/buffer-shim.ts
export class Buffer {
  public data: Uint8Array;

  constructor(data: ArrayBuffer | ArrayLike<number> | number) {
    if (typeof data === 'number') {
      this.data = new Uint8Array(data);
    } else {
      this.data = new Uint8Array(data);
    }
  }

  static from(data: any, encoding?: string): Buffer {
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      return new Buffer(encoder.encode(data));
    } else if (data instanceof ArrayBuffer) {
      return new Buffer(data);
    } else if (Array.isArray(data)) {
      return new Buffer(new Uint8Array(data));
    } else if (data?.buffer instanceof ArrayBuffer) {
      return new Buffer(data.buffer);
    }
    return new Buffer(new Uint8Array(0));
  }

  static alloc(size: number, fill?: number | string, encoding?: string): Buffer {
    const buffer = new Buffer(size);
    if (fill !== undefined) {
      if (typeof fill === 'string') {
        const encoder = new TextEncoder();
        const fillBytes = encoder.encode(fill);
        for (let i = 0; i < size; i++) {
          buffer.data[i] = fillBytes[i % fillBytes.length];
        }
      } else {
        buffer.data.fill(fill);
      }
    }
    return buffer;
  }

  static allocUnsafe(size: number): Buffer {
    return new Buffer(size);
  }

  static allocUnsafeSlow(size: number): Buffer {
    return new Buffer(size);
  }

  static isBuffer(obj: any): obj is Buffer {
    return obj instanceof Buffer;
  }

  static byteLength(string: string, encoding?: string): number {
    const encoder = new TextEncoder();
    return encoder.encode(string).length;
  }

  static compare(buf1: Buffer, buf2: Buffer): number {
    // Simple comparison implementation
    const a = buf1.data;
    const b = buf2.data;
    
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }

  static concat(buffers: Buffer[], totalLength?: number): Buffer {
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
  toString(encoding: string = 'utf8', start?: number, end?: number): string {
    const slice = this.data.subarray(start, end);
    const decoder = new TextDecoder();
    return decoder.decode(slice);
  }

  equals(other: Buffer): boolean {
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (this.data[i] !== other.data[i]) return false;
    }
    return true;
  }

  compare(other: Buffer, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number {
    return Buffer.compare(this, other);
  }

  copy(target: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number {
    const start = sourceStart || 0;
    const end = sourceEnd || this.length;
    const targetIdx = targetStart || 0;
    const length = Math.min(end - start, target.length - targetIdx);
    
    target.data.set(this.data.subarray(start, start + length), targetIdx);
    return length;
  }

  slice(start?: number, end?: number): Buffer {
    return new Buffer(this.data.subarray(start, end));
  }

  subarray(start?: number, end?: number): Buffer {
    return this.slice(start, end);
  }

  write(string: string, offset?: number, length?: number, encoding?: string): number {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(string);
    const start = offset || 0;
    const writeLength = length || encoded.length;
    
    this.data.set(encoded.subarray(0, writeLength), start);
    return Math.min(writeLength, encoded.length);
  }

  writeUInt8(value: number, offset: number): number {
    this.data[offset] = value & 0xFF;
    return offset + 1;
  }

  writeUInt16LE(value: number, offset: number): number {
    this.data[offset] = value & 0xFF;
    this.data[offset + 1] = (value >>> 8) & 0xFF;
    return offset + 2;
  }

  writeUInt32LE(value: number, offset: number): number {
    this.data[offset] = value & 0xFF;
    this.data[offset + 1] = (value >>> 8) & 0xFF;
    this.data[offset + 2] = (value >>> 16) & 0xFF;
    this.data[offset + 3] = (value >>> 24) & 0xFF;
    return offset + 4;
  }

  readUInt8(offset: number): number {
    return this.data[offset];
  }

  readUInt16LE(offset: number): number {
    return this.data[offset] + (this.data[offset + 1] << 8);
  }

  readUInt32LE(offset: number): number {
    return (
      this.data[offset] +
      (this.data[offset + 1] << 8) +
      (this.data[offset + 2] << 16) +
      (this.data[offset + 3] << 24)
    );
  }

  // Property accessors to mimic Uint8Array
  get length(): number {
    return this.data.length;
  }

  [index: number]: number;

  // Iterator support
  [Symbol.iterator](): IterableIterator<number> {
    return this.data[Symbol.iterator]();
  }

  entries(): IterableIterator<[number, number]> {
    return this.data.entries();
  }

  keys(): IterableIterator<number> {
    return this.data.keys();
  }

  values(): IterableIterator<number> {
    return this.data.values();
  }
}

// Add index signature support
Object.defineProperty(Buffer.prototype, 'length', {
  get: function() { return this.data.length; }
});

// Proxy index access to underlying Uint8Array
const handler = {
  get(target: Buffer, prop: string | symbol) {
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return target.data[Number(prop)];
    }
    return (target as any)[prop];
  },
  set(target: Buffer, prop: string | symbol, value: number) {
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      target.data[Number(prop)] = value;
      return true;
    }
    (target as any)[prop] = value;
    return true;
  }
};

// Create a proxy wrapper function
export const createBuffer = (data: any): Buffer => {
  return new Proxy(new Buffer(data), handler);
};

// Default export maintains API compatibility
export default Buffer;
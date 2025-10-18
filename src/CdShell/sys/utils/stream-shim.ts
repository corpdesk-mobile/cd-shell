export class Readable {
  pipe() { return this; }
  on() { return this; }
}

export class Writable {
  write() { return true; }
  end() { return this; }
  on() { return this; }
}

export class Transform {
  pipe() { return this; }
  on() { return this; }
}

export class Duplex {
  pipe() { return this; }
  on() { return this; }
  write() { return true; }
  end() { return this; }
}

export default { Readable, Writable, Transform, Duplex };
class Reader {
  private offset: number;
  private length: number;
  private littleEndian: boolean;
  private view: DataView;

  constructor(buffer: Buffer, offset = 0, length?: number, littleEndian = false) {
    this.offset = offset;
    this.length = length || (buffer.length - offset);
    this.littleEndian = littleEndian;
    this.view = new DataView(buffer.buffer, this.offset, this.offset);
  }


  public readInt8(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 1;
    return this.view.getInt8(offset);
  }

  public readInt16(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 2;
    return this.view.getInt16(offset, littleEndian || this.littleEndian);
  }

  public readInt32(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    return this.view.getInt32(offset, littleEndian || this.littleEndian);
  }

  public readUint8(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 1;
    return this.view.getUint8(offset);
  }

  public readUint16(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 2;
    return this.view.getUint16(offset, littleEndian || this.littleEndian);
  }

  public readUint32(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    return this.view.getUint32(offset, littleEndian || this.littleEndian);
  }

  public readFloat32(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    return this.view.getFloat32(offset, littleEndian || this.littleEndian);
  }

  public readFloat64(offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 8;
    return this.view.getFloat64(offset, littleEndian || this.littleEndian);
  }

  public readBytes(length: number, offset?: number) {
    offset = offset || this.offset;
  
    if (length < 0 || offset + length > this.length) {
      throw new Error('Reader exceeded buffer length.');
    }

    let buffer = [];
    for (let i = 0; i < length; i++) {
      buffer.push(this.view.getUint8(offset + i));
    }

    this.offset = offset + length;
    return buffer;
  }

  public readString(length: number, offset?: number) {
    offset = offset || this.offset;

    if (length < 0 || offset + length > this.length) {
      throw new Error('Reader exceeded buffer length.');
    }

    let string = '';
    for (let i = 0; i < length; i++) {
      string += String.fromCharCode(this.readUint8(offset + i));
    }

    this.offset = offset + length;
    return string;
  }

  public readChar(offset?: number) {
    return this.readString(1, offset);
  }

  public readFixed(offset?: number) {
    offset = offset || this.offset;
    let value = this.readInt32(offset, false) / 65536.0;
    return Math.ceil(value * 100000) / 100000;
  }

  public readLongDateTime(offset?: number) {
    offset = offset || this.offset;

    // new Date(1970, 1, 1).getTime() - new Date(1904, 1, 1).getTime();
    let delta = -2077545600000;
    let time = this.readUint32(offset + 4, false);
    let date = new Date(time * 1000 + delta);
    return date;
  }

  public seek(offset = 0) {
    if (offset < 0 || offset > this.length) {
      throw new Error('Reader exceeded buffer length.');
    }

    this.offset = offset;
    return this;
  }
}

export default Reader;

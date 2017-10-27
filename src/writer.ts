class Writer {
  private _offset?: number;
  private offset: number;
  private length: number;
  private littleEndian: boolean;
  private view: DataView;

  constructor(buffer: ArrayBuffer, offset = 0, length?: number, littleEndian = false) {
    this.offset = offset;
    this.length = length || (buffer.byteLength - this.offset);
    this.littleEndian = littleEndian;
    this.view = new DataView(buffer, this.offset, this.length);
  }

  public writeInt8(value: number, offset?: number) {
    offset = offset || this.offset;
    this.offset = offset + 1;
    this.view.setInt8(offset, value);
    return this;
  }

  public writeInt16(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 2;
    this.view.setInt16(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeInt32(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    this.view.setInt32(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeUint8(value: number, offset?: number) {
    offset = offset || this.offset;
    this.offset = offset + 1;
    this.view.setUint8(offset, value);
    return this;
  }

  public writeUint16(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 2;
    this.view.setUint16(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeUint32(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    this.view.setUint32(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeFloat32(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 4;
    this.view.setFloat32(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeFloat64(value: number, offset?: number, littleEndian?: boolean) {
    offset = offset || this.offset;
    this.offset = offset + 8;
    this.view.setFloat64(offset, value, littleEndian || this.littleEndian);
    return this;
  }

  public writeBytes(value: ArrayBuffer|Array<number>, length?: number, offset?: number) {
    length = length ||
             (value instanceof Array ? value.length : undefined) ||
             (value instanceof ArrayBuffer ? value.byteLength : undefined);
    if (!length) {
      return this;
    }
    offset = offset || this.offset;

    if (length < 0 || offset + length > this.length) {
      throw new Error('Writer exceeded buffer length')
    }
    
    if (value instanceof ArrayBuffer) {
      let view = new DataView(value, 0, length);
      for (let i = 0; i < length; i++) {
        this.view.setUint8(offset + i, view.getUint8(i));
      }
    } else {
      for (let i = 0; i < length; i++) {
        this.view.setUint8(offset + i, value[i]);
      }
    }

    this.offset = offset + length;
    return this;
  }

  public writeEmpty(length: number, offset?: number) {
    if (length < 0) {
      throw new Error('Cannot write empty length less then zero.');
    }

    offset = offset || this.offset;

    for (let i = 0; i < length; i++) {
      this.view.setUint8(offset + i, 0);
    }

    this.offset = offset + length;
    return this;
  }

  public writeString(string = '', length?: number, offset?: number) {
    offset = offset || this.offset;
    length = length || string.replace(/[^\x00-\xff]/g, '11').length;

    if (length < 0 || offset + length > this.length) {
      throw new Error('Writer exceeded buffer length')
    }

    this.seek(offset);

    for (let i = 0; i < string.length; i++) {
      let charCode = string.charCodeAt(i) || 0;
      if (charCode > 127) {
        this.writeUint16(charCode);
      } else {
        this.writeUint8(charCode);
      }
    }

    this.offset = offset + length;

    return this;
  }

  public writeChar(value: string, offset?: number) {
    return this.writeString(value, 0, offset);
  }

  public writeFixed(value: number, offset?: number) {
    offset = offset || this.offset;
    return this.writeInt32(Math.round(value * 65536), offset);
  }

  public writeLongDateTime(date: Date, offset?: number) {
    offset = offset || this.offset;

    let delta = -2077545600000;
    let time = ~~((date.getTime() - delta) / 1000);

    this.writeUint32(0, offset);
    this.writeUint32(time, offset + 4);

    return this;
  }

  public seek(offset = 0) {
    if (offset < 0 || offset > this.length) {
      throw new Error('Writer exceeded buffer length.');
    }
    this._offset = this.offset;
    this.offset = offset;

    return this;
  }

  public head() {
    this.offset = this._offset || 0;
    return this;
  }

  public getBuffer() {
    return this.view.buffer;
  }
}

export default Writer;
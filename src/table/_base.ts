import Reader from '../reader';
import Writer from '../writer';
import SfntObject from '../sfntobject';

const struct = {
  Int8: 1,
  Uint8: 2,
  Int16: 3,
  Uint16: 4,
  Int32: 5,
  Uint32: 6,
  Fixed: 7, // 32-bit signed fixed-point number (16.16)
  FUnit: 8, // Smallest measurable distance in the em space
  // 16-bit signed fixed number with the low 14 bits of fraction
  F2Dot14: 11,
  // The long internal format of a date in seconds since 12:00 midnight,
  // January 1, 1904. It is represented as a signed 64-bit integer.
  LongDateTime: 12,

  // extend data type
  Char: 13,
  String: 14,
  Bytes: 15,

  names: {
    '1': 'Int8',
    '2': 'Uint8',
    '3': 'Int16',
    '4': 'Uint16',
    '5': 'Int32',
    '6': 'Uint32',
    '7': 'Fixed',
    '8': 'FUnit',
    '11': 'F2Dot14',
    '12': 'LongDateTime',
    '13': 'Char',
    '14': 'String',
    '15': 'Bytes',
  }
};

type StructTuple = [string, number, number];

class Table {
  public name: string = '';
  protected struct: Array<StructTuple> = [];
  protected offset: number = 0;
  protected _value: any = {};

  constructor(offset = 0) {
    this.offset = offset;

  }

  public read(reader: Reader, ttf: SfntObject) {
    let offset = this.offset;
    let value: any = {};

    if (offset !== undefined) {
      reader.seek(offset);
    }

    for (let item of this.struct) {
      switch(item[1]) {
        case struct.Int8:   value[item[0]] = reader.readInt8(); break;
        case struct.Uint8:  value[item[0]] = reader.readUint8(); break;
        case struct.Int16:  value[item[0]] = reader.readInt16(); break;
        case struct.Uint16: value[item[0]] = reader.readUint16(); break;
        case struct.Int32:  value[item[0]] = reader.readInt32(); break;
        case struct.Uint32: value[item[0]] = reader.readUint32(); break;
        case struct.Fixed:  value[item[0]] = reader.readFixed(); break;
        case struct.Char:   value[item[0]] = reader.readChar(); break;
        case struct.LongDateTime:
          value[item[0]] = reader.readLongDateTime();
          break;
        case struct.Bytes:
          value[item[0]] = reader.readBytes(item[2] || 0);
          break;
        case struct.String:
          value[item[0]] = reader.readString(item[2] || 0);
          break;
        default:
          throw new Error('Invalid table read type.');
      }
    }

    this._value = value;

    return this.valueOf();
  }

  public write(writer: Writer, sfnt: SfntObject) {
    let table = sfnt[this.name];

    if (!table) {
      throw new Error('Table not found');
    }

    for (let item of this.struct) {
      switch(item[1]) {
        case struct.Int8:         writer.writeInt8(table[item[0]]); break;
        case struct.Uint8:        writer.writeUint8(table[item[0]]); break;
        case struct.Int16:        writer.writeInt16(table[item[0]]); break;
        case struct.Uint16:       writer.writeUint16(table[item[0]]); break;
        case struct.Int32:        writer.writeInt32(table[item[0]]); break;
        case struct.Uint32:       writer.writeUint32(table[item[0]]); break;
        case struct.Fixed:        writer.writeFixed(table[item[0]]); break;
        case struct.LongDateTime:
          writer.writeLongDateTime(table[item[0]]);
          break;
        case struct.Bytes:        
          writer.writeBytes(table[item[0]], item[2]||0);
          break;
        case struct.Char:         
          writer.writeChar(table[item[0]]);
          break;
        case struct.String:       
          writer.writeString(table[item[0]], item[2]||0);
          break;
        default:
          throw new Error('Table Struct Undefined for name: ' + item);
      }
    }

    return writer;
  }

  public size(sfnt?: SfntObject) {
    let size = 0;

    for (let item of this.struct) {
      switch(item[1]) {
        case struct.Int8:
        case struct.Uint8:        size += 1; break;
        case struct.Int16:
        case struct.Uint16:       size += 2; break;
        case struct.Int32:
        case struct.Uint32:
        case struct.Fixed:        size += 4; break;
        case struct.LongDateTime: size += 8; break;
        case struct.Bytes:        size += item[2] || 0; break;
        case struct.Char:         size += 1; break;
        case struct.String:       size += item[2] || 0; break;
        default:
          throw new Error('Table Struct Undefined for name: ' + item);
      }
    }
    return size;
  }

  valueOf() {
    let value: any = {};

    for (let item of this.struct) {
      value[item[0]] = this._value[item[0]];
    }

    return value;
  }

}

export {Table, Reader, Writer, SfntObject, StructTuple, struct};

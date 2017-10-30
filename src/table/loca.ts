import {Table, Reader, Writer, SfntObject, struct} from './_base';

class Loca extends Table {
  public name = 'lcoa';

  public read(reader: Reader, sfnt: SfntObject) {
    let offset = this.offset;
    let indexToLocFormat = sfnt.head._value.indexToLocFormat;
    let numGlyphs = sfnt.maxp._value.numGlyphs;
    let wordOffset = [];

    reader.seek(offset);

    // indexToLocFormat有2字节和4字节的区别
    for (let i = 0; i < numGlyphs; i++) {
      if (indexToLocFormat === 0) {
        wordOffset.push(reader.readUint16(offset, false) * 2);
        offset += 2;        
      } else {
        wordOffset.push(reader.readUint32(offset, false) * 1);
        offset += 4;        
      }
    }

    return wordOffset;
  }

  public write(writer: Writer, sfnt: SfntObject) {
    let glyfSupport = sfnt.support.glyf;
    let offset = sfnt.support.glyf.offset || 0;
    let indexToLocFormat = sfnt.head._value.indexToLocFormat;
    let sizeRatio = (indexToLocFormat === 0) ? 0.5 : 1;
    let numGlyphs = sfnt.glyf._value.length;

    for (let i = 0; i < numGlyphs; ++i) {
      if (indexToLocFormat) {
        writer.writeUint32(offset);
      }
      else {
        writer.writeUint16(offset);
      }
      offset += glyfSupport[i].size * sizeRatio;
    }

    // write extra
    if (indexToLocFormat) {
      writer.writeUint32(offset);
    }
    else {
      writer.writeUint16(offset);
    }

    return writer;
  }

  public size(sfnt: SfntObject) {
    let locaCount = sfnt.glyf._value.length + 1;
    return sfnt.head._value.indexToLocFormat ? locaCount * 4 : locaCount * 2;
  }
}

export default Loca;
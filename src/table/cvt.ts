import { Table, Reader, Writer, SfntObject, StructTuple, struct } from './_base';

class Cvt extends Table {
  public name = 'cvt';

  public read(reader: Reader, sfnt: SfntObject) {
    return reader.readBytes(this.offset, sfnt.tables.cvt.length);
  }

  public write(writer: Writer, sfnt: SfntObject) {
    if (sfnt.cvt) {
      writer.writeBytes(sfnt.cvt, sfnt.cvt.length);
    }

    return writer;
  }

  public size(sfnt: SfntObject) {
    return sfnt.cvt ? sfnt.cvt.length : 0;
  }
}

export default Cvt;

import { Table, Reader, Writer, SntfObject, StructTuple, struct } from './_base';

class Cvt extends Table {
  public name = 'cvt';

  public read(reader: Reader, sntf: SntfObject) {
    return reader.readBytes(this.offset, sntf.tables.cvt.length);
  }

  public write(writer: Writer, sntf: SntfObject) {
    if (sntf.cvt) {
      writer.writeBytes(sntf.cvt, sntf.cvt.length);
    }

    return writer;
  }

  public size(sntf: SntfObject) {
    return sntf.cvt ? sntf.cvt.length : 0;
  }
}

export default Cvt;

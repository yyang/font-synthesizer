import {Table, Reader, Writer, SntfObject, StructTuple, struct} from './_base';

class Fpgm extends Table {
  public name = 'fpgm';

  public read(reader: Reader, sntf: SntfObject) {
    return reader.readBytes(this.offset, sntf.tables.fpgm.length);
  }

  public write(writer: Writer, sntf: SntfObject) {
    if (sntf.fpgm) {
      writer.writeBytes(sntf.fpgm, sntf.fpgm.length);
    }
    return writer;
  }

  public size(sntf: SntfObject) {
    return sntf.fpgm ? sntf.fpgm.length : 0;
  }
}

export default Fpgm;

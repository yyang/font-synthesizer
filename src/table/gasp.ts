import {Table, Reader, Writer, SntfObject, StructTuple, struct} from './_base';

class Gasp extends Table {
  public name = 'gasp';

  public read(reader: Reader, sntf: SntfObject) {
    return reader.readBytes(this.offset, sntf.tables.gasp.length);
  }

  public write(writer: Writer, sntf: SntfObject) {
    if (sntf.gasp) {
      writer.writeBytes(sntf.gasp, sntf.gasp.length);
    }
    return writer;
  }

  public size(sntf: SntfObject) {
    return sntf.gasp ? sntf.gasp.length : 0;
  }
}

export default Gasp;

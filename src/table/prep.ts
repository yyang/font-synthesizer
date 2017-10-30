import {Table, Reader, Writer, SntfObject, StructTuple, struct} from './_base';

class Prep extends Table {
  public name = 'prep';

  public read(reader: Reader, sntf: SntfObject) {
    var length = sntf.tables.prep.length;
    return reader.readBytes(this.offset, length);
  }

  public write(writer: Writer, sntf: SntfObject) {
    if (sntf.prep) {
      writer.writeBytes(sntf.prep, sntf.prep.length);
    }
    return writer;
  }

  public size(sntf: SntfObject) {
    return sntf.prep ? sntf.prep.length : 0;
  }
}

export default Prep;

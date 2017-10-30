import {Table, Reader, Writer, SfntObject, StructTuple, struct} from './_base';

class Fpgm extends Table {
  public name = 'fpgm';

  public read(reader: Reader, sfnt: SfntObject) {
    return reader.readBytes(this.offset, sfnt.tables.fpgm.length);
  }

  public write(writer: Writer, sfnt: SfntObject) {
    if (sfnt.fpgm) {
      writer.writeBytes(sfnt.fpgm, sfnt.fpgm.length);
    }
    return writer;
  }

  public size(sfnt: SfntObject) {
    return sfnt.fpgm ? sfnt.fpgm.length : 0;
  }
}

export default Fpgm;

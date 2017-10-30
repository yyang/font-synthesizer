import {Table, Reader, Writer, SfntObject, StructTuple, struct} from './_base';

class Gasp extends Table {
  public name = 'gasp';

  public read(reader: Reader, sfnt: SfntObject) {
    return reader.readBytes(this.offset, sfnt.tables.gasp.length);
  }

  public write(writer: Writer, sfnt: SfntObject) {
    if (sfnt.gasp) {
      writer.writeBytes(sfnt.gasp, sfnt.gasp.length);
    }
    return writer;
  }

  public size(sfnt: SfntObject) {
    return sfnt.gasp ? sfnt.gasp.length : 0;
  }
}

export default Gasp;

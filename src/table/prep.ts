import {Table, Reader, Writer, SfntObject, StructTuple, struct} from './_base';

class Prep extends Table {
  public name = 'prep';

  public read(reader: Reader, sfnt: SfntObject) {
    var length = sfnt.tables.prep.length;
    return reader.readBytes(this.offset, length);
  }

  public write(writer: Writer, sfnt: SfntObject) {
    if (sfnt.prep) {
      writer.writeBytes(sfnt.prep, sfnt.prep.length);
    }
    return writer;
  }

  public size(sfnt: SfntObject) {
    return sfnt.prep ? sfnt.prep.length : 0;
  }
}

export default Prep;

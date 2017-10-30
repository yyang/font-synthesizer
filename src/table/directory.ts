import {Table, Reader, Writer, SfntObject, struct} from './_base';

class Directory extends Table {
  public name = 'directory';

  public read(reader: Reader, sfnt: SfntObject) {
    let tables:any = {};
    let numTables = sfnt.numTables;
    let offset = this.offset;
    let length = numTables * 16;

    for (let i = offset; i < length; i += 16) {
      let name = reader.readString(i, 4).trim();

      tables[name] = {
        name,
        checkSum: reader.readUint32(i + 4),
        offset:   reader.readUint32(i + 8),
        length:   reader.readUint32(i + 12)
      };
    }

    return tables;
  }

  public write(writer: Writer, sfnt: SfntObject) {
    let tables = sfnt.support.tables;

    for (var i = 0, l = tables.length; i < l; i++) {
      writer.writeString((tables[i].name + '    ').slice(0, 4));
      writer.writeUint32(tables[i].checkSum);
      writer.writeUint32(tables[i].offset);
      writer.writeUint32(tables[i].length);
    }

    return writer;
  }

  public size(sfnt: SfntObject) {
    return sfnt.numTables * 16;
  }
}

export default Directory;

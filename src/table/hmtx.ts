import { Table, Reader, Writer, SfntObject, StructTuple, struct } from './_base';
import { HMetric } from './_interface';

class Hmtx extends Table {
  public name = 'hmtx';

  public read(reader: Reader, sfnt: SfntObject) {
    let offset = this.offset;
    reader.seek(offset);

    let numOfLongHorMetrics = sfnt.hhea.numOfLongHorMetrics;
    let hMetrics: Array<HMetric> = [];
    for (let i = 0; i < numOfLongHorMetrics; ++i) {
      let advanceWidth = reader.readUint16();
      let leftSideBearing = reader.readInt16();
      hMetrics.push({advanceWidth, leftSideBearing});
    }

    // 最后一个宽度
    let lastAdvanceWidth = hMetrics[numOfLongHorMetrics - 1].advanceWidth;
    let numOfLast = sfnt.maxp.numGlyphs - numOfLongHorMetrics;

    // 获取后续的hmetrics
    for (let i = 0; i < numOfLast; ++i) {
      let leftSideBearing = reader.readInt16();
      hMetrics.push({advanceWidth: lastAdvanceWidth, leftSideBearing});
    }

    return hMetrics;

  }

  public write(writer: Writer, sfnt: SfntObject) {
    let i;
    let numOfLongHorMetrics = sfnt.hhea.numOfLongHorMetrics;
    for (i = 0; i < numOfLongHorMetrics; ++i) {
      writer.writeUint16(sfnt.glyf[i].advanceWidth);
      writer.writeInt16(sfnt.glyf[i].leftSideBearing);
    }

    // 最后一个宽度
    let numOfLast = sfnt.glyf.length - numOfLongHorMetrics;

    for (i = 0; i < numOfLast; ++i) {
      writer.writeInt16(sfnt.glyf[numOfLongHorMetrics + i].leftSideBearing);
    }

    return writer;
  }

  public size(sfnt: SfntObject) {

    // 计算同最后一个advanceWidth相等的元素个数
    let numOfLast = 0;
    // 最后一个advanceWidth
    let advanceWidth = sfnt.glyf[sfnt.glyf.length - 1].advanceWidth;

    for (let i = sfnt.glyf.length - 2; i >= 0; i--) {
      if (advanceWidth === sfnt.glyf[i].advanceWidth) {
        numOfLast++;
      } else {
        break;
      }
    }

    sfnt.hhea.numOfLongHorMetrics = sfnt.glyf.length - numOfLast;

    return 4 * sfnt.hhea.numOfLongHorMetrics + 2 * numOfLast;
  }
}

export default Hmtx;

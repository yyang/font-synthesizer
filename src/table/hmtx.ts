import { Table, Reader, Writer, SntfObject, StructTuple, struct } from './_base';
import { HMetric } from './_interface';

class Hmtx extends Table {
  public name = 'hmtx';

  public read(reader: Reader, sntf: SntfObject) {
    let offset = this.offset;
    reader.seek(offset);

    let numOfLongHorMetrics = sntf.hhea.numOfLongHorMetrics;
    let hMetrics: Array<HMetric> = [];
    for (let i = 0; i < numOfLongHorMetrics; ++i) {
      let advanceWidth = reader.readUint16();
      let leftSideBearing = reader.readInt16();
      hMetrics.push({advanceWidth, leftSideBearing});
    }

    // 最后一个宽度
    let lastAdvanceWidth = hMetrics[numOfLongHorMetrics - 1].advanceWidth;
    let numOfLast = sntf.maxp.numGlyphs - numOfLongHorMetrics;

    // 获取后续的hmetrics
    for (let i = 0; i < numOfLast; ++i) {
      let leftSideBearing = reader.readInt16();
      hMetrics.push({advanceWidth: lastAdvanceWidth, leftSideBearing});
    }

    return hMetrics;

  }

  public write(writer: Writer, sntf: SntfObject) {
    let i;
    let numOfLongHorMetrics = sntf.hhea.numOfLongHorMetrics;
    for (i = 0; i < numOfLongHorMetrics; ++i) {
      writer.writeUint16(sntf.glyf[i].advanceWidth);
      writer.writeInt16(sntf.glyf[i].leftSideBearing);
    }

    // 最后一个宽度
    let numOfLast = sntf.glyf.length - numOfLongHorMetrics;

    for (i = 0; i < numOfLast; ++i) {
      writer.writeInt16(sntf.glyf[numOfLongHorMetrics + i].leftSideBearing);
    }

    return writer;
  }

  public size(sntf: SntfObject) {

    // 计算同最后一个advanceWidth相等的元素个数
    let numOfLast = 0;
    // 最后一个advanceWidth
    let advanceWidth = sntf.glyf[sntf.glyf.length - 1].advanceWidth;

    for (let i = sntf.glyf.length - 2; i >= 0; i--) {
      if (advanceWidth === sntf.glyf[i].advanceWidth) {
        numOfLast++;
      } else {
        break;
      }
    }

    sntf.hhea.numOfLongHorMetrics = sntf.glyf.length - numOfLast;

    return 4 * sntf.hhea.numOfLongHorMetrics + 2 * numOfLast;
  }
}

export default Hmtx;

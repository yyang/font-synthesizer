import { Table, Reader, Writer, SfntObject, struct } from './_base';

const readWindowsAllCodes = function(tables: Array<SubTable>, sfnt: SfntObject) {
  var codes: any = {};

  // Reads windows unicode
  let format0 = tables.filter(tb => tb.format === 0)[0];

  if (format0) {
    let glyphIdArray = <Array<number>>(format0.glyphIdArray);
    for (let i = 0; i < glyphIdArray.length; i++) {
      if (glyphIdArray[i]) codes[i] = glyphIdArray[i];
    }
  }

  // Reads windows unicode
  let format12 = tables.filter(tb =>
    tb.platformId === 3 && tb.encodingId === 10 && tb.format === 12)[0];
  let format4 = tables.filter(tb =>
    tb.platformId === 3 && tb.encodingId === 1 && tb.format === 4)[0];
  let format2 = tables.filter(tb =>
    tb.platformId === 3 && tb.encodingId === 3 && tb.format === 2)[0];

  if (format12) {
    // Reads format 12
    let groups = <Array<SubTableGroup>>(format12.groups);
    for (let i = 0; i < (<number>format12.nGroups); i++) {
      let { startId, start, end } = groups[i];
      while (start <= end) {
        codes[start++] = startId++;
      }
    }
  } else if (format4) {
    // Reads format 4

    // calculate graphIdArray and idRangeOffset
    let graphIdArrayIndexOffset = ((<number>format4.glyphIdArrayOffset) - (<number>format4.idRangeOffsetOffset)) / 2;
    // confirm structure
    let startCode = <Array<number>>format4.startCode;
    let endCode = <Array<number>>format4.endCode;
    let idRangeOffset = <Array<number>>format4.idRangeOffset;
    let idDelta = <Array<number>>format4.idDelta;
    let glyphIdArray = <Array<number>>format4.glyphIdArray;

    for (let i = 0; i < (<number>format4.segCountX2 / 2); i++) {
      let start = startCode[i];
      let end = endCode[i];

      while (start <= end) {

        if (idRangeOffset[i] === 0) {
          // range offset = 0
          codes[start] = (start + idDelta[i]) % 0x10000;
        } else {
          // rely on to glyphIndexArray
          let index = i + idRangeOffset[i] / 2
            + (start - startCode[i])
            - graphIdArrayIndexOffset;

          let graphId = glyphIdArray[index];
          codes[start] = (graphId === 0) ? 0 : (graphId + idDelta[i]) % 0x10000;
        }

        start++;
      }
    }

    delete codes[65535];
  } else if (format2) {
    // Reads format2
    // see https://github.com/fontforge/fontforge/blob/master/fontforge/parsettf.c
    let subHeadKeys = <Array<number>>format2.subHeadKeys;
    let subHeads = <Array<SubTableSubHead>>format2.subHeads;
    let glyphs = <Array<number>>format2.glyphs;
    let numGlyphs = sfnt.maxp._value.numGlyphs;
    let index = 0;

    for (let i = 0; i < 256; i++) {
      // Single byte encoding
      if (subHeadKeys[i] === 0) {
        if (i >= <number>format2.maxPos ||
          i < subHeads[0].firstCode ||
          i >= subHeads[0].firstCode + subHeads[0].entryCount ||
          subHeads[0].idRangeOffset + (i - subHeads[0].firstCode) >= glyphs.length) {
          index = 0;
        } else if ((index = glyphs[subHeads[0].idRangeOffset + (i - subHeads[0].firstCode)]) !== 0) {
          index = index + subHeads[0].idDelta;
        }

        // Single byte decoding
        if (index !== 0 && index < numGlyphs) {
          codes[i] = index;
        }
      } else {
        let k = subHeadKeys[i];
        for (let j = 0; j < subHeads[k].entryCount; j++) {
          if (subHeads[k].idRangeOffset + j >= glyphs.length) {
            index = 0;
          } else if ((index = glyphs[subHeads[k].idRangeOffset + j]) !== 0) {
            index = index + subHeads[k].idDelta;
          }

          if (index !== 0 && index < numGlyphs) {
            let unicode = ((i << 8) | (j + subHeads[k].firstCode)) % 0xffff;
            codes[unicode] = index;
          }
        }
      }
    }
  }

  // TODO: Format 6 not implemented

  return codes;
}

const readSubTable = function(reader: Reader, sfnt: SfntObject, subTable: SubTable, cmapOffset: number) {
  let glyphIdArray: Array<number> = [];
  let startOffset = cmapOffset + subTable.offset;
  subTable.format = reader.readUint16(startOffset);

  // 0～256 condensed
  if (subTable.format === 0) {
    // Jump through Format.
    subTable.length = reader.readUint16();
    subTable.language = reader.readUint16();
    for (let i = 0; i < subTable.length - 6; i++) {
      glyphIdArray.push(reader.readUint8());
    }
    subTable.glyphIdArray = glyphIdArray;
    return subTable;
  }

  if (subTable.format === 2) {
    // Jump through Format.
    subTable.length = reader.readUint16();
    subTable.language = reader.readUint16();

    let subHeadKeys: Array<number> = [];
    for (let i = 0; i < 256; i++) {
      subHeadKeys[i] = reader.readUint16() / 8;
    }
    let maxSubHeadKey = Math.max(...subHeadKeys);
    let maxPos = subHeadKeys.indexOf(maxSubHeadKey);

    var subHeads = [];
    for (let j = 0; j <= maxSubHeadKey; j++) {
      let firstCode = reader.readUint16();
      let entryCount = reader.readUint16();
      let idDelta = reader.readUint16();
      let idRangeOffset = (reader.readUint16() - (maxSubHeadKey - j) * 8 - 2) / 2;
      subHeads[j] = { firstCode, entryCount, idDelta, idRangeOffset };
    }

    let glyphs: Array<number> = [];
    for (let k = 0; k < (startOffset + subTable.length - reader.offset) / 2; k++) {
      glyphs[k] = reader.readUint16();
    }

    subTable.subHeadKeys = subHeadKeys;
    subTable.maxPos = maxPos;
    subTable.subHeads = subHeads;
    subTable.glyphs = glyphs;

    return subTable;
  }

  // Double bytes condensed
  if (subTable.format === 4) {
    // Jump through format
    subTable.length = reader.readUint16();
    subTable.language = reader.readUint16();

    subTable.segCountX2 = reader.readUint16();
    subTable.searchRange = reader.readUint16();
    subTable.entrySelector = reader.readUint16();
    subTable.rangeShift = reader.readUint16();

    let segCount = subTable.segCountX2 / 2;

    // end code
    let endCode: Array<number> = [];
    for (let i = 0; i < segCount; i++) {
      endCode.push(reader.readUint16());
    }
    subTable.endCode = endCode;
    subTable.reservedPad = reader.readUint16();

    // start code
    let startCode: Array<number> = [];
    for (let i = 0; i < segCount; i++) {
      startCode.push(reader.readUint16());
    }
    subTable.startCode = startCode;

    // idDelta
    let idDelta: Array<number> = [];
    for (let i = 0; i < segCount; i++) {
      idDelta.push(reader.readUint16());
    }
    subTable.idDelta = idDelta;


    subTable.idRangeOffsetOffset = reader.offset;
    // idRangeOffset
    let idRangeOffset: Array<number> = [];
    for (let i = 0; i < segCount; i++) {
      idRangeOffset.push(reader.readUint16());
    }
    subTable.idRangeOffset = idRangeOffset;

    // 记录array offset
    subTable.glyphIdArrayOffset = reader.offset;

    // glyphIdArray
    for (let i = 0; i < (subTable.length - (reader.offset - startOffset)) / 2; i++) {
      glyphIdArray.push(reader.readUint16());
    }
    subTable.glyphIdArray = glyphIdArray;

    return subTable;
  }

  if (subTable.format === 6) {
    subTable.length = reader.readUint16();
    subTable.language = reader.readUint16();
    subTable.firstCode = reader.readUint16();
    subTable.entryCount = reader.readUint16();
    subTable.glyphIdArrayOffset = reader.offset;

    for (let i = 0; i < subTable.entryCount; i++) {
      glyphIdArray.push(reader.readUint16());
    }
    subTable.glyphIdArray = glyphIdArray;

    return subTable;
  }

  // Defines segments for sparse representation in 4-byte character space
  if (subTable.format === 12) {
    subTable.reserved = reader.readUint16();
    subTable.length = reader.readUint32();
    subTable.language = reader.readUint32();
    subTable.nGroups = reader.readUint32();

    var groups = [];
    // 读取字符分组
    for (let i = 0; i < subTable.nGroups; i++) {
      let start = reader.readUint32();
      let end = reader.readUint32();
      let startId = reader.readUint32();
      groups.push({ start, end, startId });
    }
    subTable.groups = groups;

    return subTable;
  }

  throw new Error('not support cmap format:' + subTable.format);
}

const writeSubTable0 = function(writer: Writer, unicodes) {

  writer.writeUint16(0); // format
  writer.writeUint16(262); // length
  writer.writeUint16(0); // language

  // Array of unicodes 0..255
  var i = -1;
  var unicode;
  while ((unicode = unicodes.shift())) {
    while (++i < unicode[0]) {
      writer.writeUint8(0);
    }

    writer.writeUint8(unicode[1]);
    i = unicode[0];
  }

  while (++i < 256) {
    writer.writeUint8(0);
  }

  return writer;
}


function writeSubTable4(writer: Writer, segments: Array<number>) {

  writer.writeUint16(4); // format
  writer.writeUint16(24 + segments.length * 8); // length
  writer.writeUint16(0); // language

  let segCount = segments.length + 1;
  let maxExponent = Math.floor(Math.log(segCount) / Math.LN2);
  let searchRange = 2 * Math.pow(2, maxExponent);

  writer.writeUint16(segCount * 2); // segCountX2
  writer.writeUint16(searchRange); // searchRange
  writer.writeUint16(maxExponent); // entrySelector
  writer.writeUint16(2 * segCount - searchRange); // rangeShift

  // end list
  for (let segment of segments)
    writer.writeUint16(segment.end);
  };
  writer.writeUint16(0xFFFF); // end code
  writer.writeUint16(0); // reservedPad


  // start list
  segments.forEach(function (segment) {
    writer.writeUint16(segment.start);
  });
  writer.writeUint16(0xFFFF); // start code

  // id delta
  segments.forEach(function (segment) {
    writer.writeUint16(segment.delta);
  });
  writer.writeUint16(1);

  // Array of range offsets, it doesn't matter when deltas present
  for (var i = 0, l = segments.length; i < l; i++) {
    writer.writeUint16(0);
  }
  writer.writeUint16(0); // rangeOffsetArray should be finished with 0

  return writer;
}

/**
 * 创建`子表12`
 *
 * @param {Writer} writer 写对象
 * @param {Array} segments 分块编码列表
 * @return {Writer}
 */
function writeSubTable12(writer, segments) {

  writer.writeUint16(12); // format
  writer.writeUint16(0); // reserved
  writer.writeUint32(16 + segments.length * 12); // length
  writer.writeUint32(0); // language
  writer.writeUint32(segments.length); // nGroups

  segments.forEach(function (segment) {
    writer.writeUint32(segment.start);
    writer.writeUint32(segment.end);
    writer.writeUint32(segment.startId);
  });

  return writer;
}

/**
 * 写subtableheader
 *
 * @param {Writer} writer Writer对象
 * @param {number} platform 平台
 * @param {number} encoding 编码
 * @param {number} offset 偏移
 * @return {Writer}
 */
function writeSubTableHeader(writer, platform, encoding, offset) {
  writer.writeUint16(platform); // platform
  writer.writeUint16(encoding); // encoding
  writer.writeUint32(offset); // offset
  return writer;
}


/**
         * 获取format4 delta值
         * Delta is saved in signed int in cmap format 4 subtable,
         * but can be in -0xFFFF..0 interval.
         * -0x10000..-0x7FFF values are stored with offset.
         *
         * @param {number} delta delta值
         * @return {number} delta值
         */
function encodeDelta(delta) {
  return delta > 0x7FFF
    ? delta - 0x10000
    : (delta < -0x7FFF ? delta + 0x10000 : delta);
}

/**
 * 根据bound获取glyf segment
 *
 * @param {Array} glyfUnicodes glyf编码集合
 * @param {number} bound 编码范围
 * @return {Array} 码表
 */
function getSegments(glyfUnicodes, bound) {

  var prevGlyph = null;
  var result = [];
  var segment = {};

  glyfUnicodes.forEach(function (glyph) {

    if (bound === undefined || glyph.unicode <= bound) {
      // 初始化编码头部，这里unicode和graph id 都必须连续
      if (prevGlyph === null
        || glyph.unicode !== prevGlyph.unicode + 1
        || glyph.id !== prevGlyph.id + 1
      ) {
        if (prevGlyph !== null) {
          segment.end = prevGlyph.unicode;
          result.push(segment);
          segment = {
            start: glyph.unicode,
            startId: glyph.id,
            delta: encodeDelta(glyph.id - glyph.unicode)
          };
        }
        else {
          segment.start = glyph.unicode;
          segment.startId = glyph.id;
          segment.delta = encodeDelta(glyph.id - glyph.unicode);
        }
      }

      prevGlyph = glyph;
    }
  });

  // need to finish the last segment
  if (prevGlyph !== null) {
    segment.end = prevGlyph.unicode;
    result.push(segment);
  }

  // 返回编码范围
  return result;
}

/**
 * 获取format0编码集合
 *
 * @param {Array} glyfUnicodes glyf编码集合
 * @return {Array} 码表
 */
function getFormat0Segment(glyfUnicodes: Array<[number, number]>) {
  var unicodes = [];
  for (let u of glyfUnicodes) {
    if (u.unicode !== undefined && u.unicode < 256) {
      unicodes.push([u.unicode, u.id]);
    }
  });

  // 按编码排序
  unicodes.sort(function (a, b) {
    return a[0] - b[0];
  });

  return unicodes;
}

interface SubTableGroup {
  start: number;
  end: number;
  startId: number;
}
interface SubTableSubHead {
  firstCode: number;
  entryCount: number;
  idDelta: number;
  idRangeOffset: number;
}
interface SubTable {
  // General Information
  platformId: number;
  encodingId: number;
  offset: number;
  // Format Information
  format?: number;
  length?: number;
  language?: number;
  // Glyphs
  glyphIdArray?: Array<number>;
  glyphIdArrayOffset?: number;
  // Format 2
  subHeadKeys?: Array<number>;
  maxPos?: number;
  subHeads?: Array<SubTableSubHead>;
  glyphs?: Array<number>;
  // Format 4
  segCountX2?: number;
  searchRange?: number;
  entrySelector?: number;
  rangeShift?: number;
  reservedPad?: number;
  startCode?: Array<number>;
  endCode?: Array<number>;
  idDelta?: Array<number>;
  idRangeOffset?: Array<number>;
  idRangeOffsetOffset?: number;
  // Format 6
  firstCode?: number;
  entryCount?: number;
  // Format 12
  reserved?: number;
  nGroups?: number;
  groups?: Array<SubTableGroup>;
}

class Cmap extends Table {
  public name = 'cmap';

  public read(reader: Reader, sfnt: SfntObject) {
    reader.seek(this.offset);
    this._value.version = reader.readUint16(); // 编码方式
    this._value.subtableLength = reader.readUint16(); // 表个数

    let subTables: Array<SubTable> = []; // 名字表
    let offset = reader.offset;

    // 使用offset读取，以便于查找
    for (let i = 0; i < this._value.subtableLength; i++) {
      let platformId = reader.readUint16(offset);
      let encodingId = reader.readUint16(offset + 2);
      let subTableOffset = reader.readUint32(offset + 4);
      subTables.push(readSubTable(reader, sfnt, {
        platformId,
        encodingId,
        offset: subTableOffset
      }, this.offset));

      offset += 8;
    }

    this._value.subTables = subTables;

    return readWindowsAllCodes(subTables, sfnt);
  }

  public write(writer: Writer, sfnt: SfntObject) {
    var hasGLyphsOver2Bytes = sfnt.support.cmap.hasGLyphsOver2Bytes;

    // write table header.
    writer.writeUint16(0); // version
    writer.writeUint16(hasGLyphsOver2Bytes ? 4 : 3); // count

    // header size
    var subTableOffset = 4 + (hasGLyphsOver2Bytes ? 32 : 24);
    var format4Size = sfnt.support.cmap.format4Size;
    var format0Size = sfnt.support.cmap.format0Size;

    // subtable 4, unicode
    writeSubTableHeader(writer, 0, 3, subTableOffset);

    // subtable 0, mac standard
    writeSubTableHeader(writer, 1, 0, subTableOffset + format4Size);

    // subtable 4, windows standard
    writeSubTableHeader(writer, 3, 1, subTableOffset);

    if (hasGLyphsOver2Bytes) {
      writeSubTableHeader(writer, 3, 10, subTableOffset + format4Size + format0Size);
    }

    // write tables, order of table seem to be magic, it is taken from TTX tool
    writeSubTable4(writer, sfnt.support.cmap.format4Segments);
    writeSubTable0(writer, sfnt.support.cmap.format0Segments);

    if (hasGLyphsOver2Bytes) {
      writeSubTable12(writer, sfnt.support.cmap.format12Segments);
    }


    return writer;
  }

  public sizeof(sfnt: SfntObject) {
    sfnt.support.cmap = {};
    let glyfUnicodes:Array<[number, number]> = [];

    sfnt.glyf.forEach((glyph, index: number) => {

      var unicodes = glyph.unicode;

      if (typeof glyph.unicode === 'number') {
        unicodes = [glyph.unicode];
      }

      if (unicodes && unicodes.length) {
        unicodes.forEach(function (unicode) {
          glyfUnicodes.push({
            unicode: unicode,
            id: unicode !== 0xFFFF ? index : 0
          });
        });
      }

    });

    glyfUnicodes = glyfUnicodes.sort(function (a, b) {
      return a.unicode - b.unicode;
    });

    sfnt.support.cmap.unicodes = glyfUnicodes;

    var unicodes2Bytes = glyfUnicodes;

    sfnt.support.cmap.format4Segments = getSegments(unicodes2Bytes, 0xFFFF);
    sfnt.support.cmap.format4Size = 24
      + sfnt.support.cmap.format4Segments.length * 8;

    sfnt.support.cmap.format0Segments = getFormat0Segment(glyfUnicodes);
    sfnt.support.cmap.format0Size = 262;

    // we need subtable 12 only if found unicodes with > 2 bytes.
    var hasGLyphsOver2Bytes = unicodes2Bytes.some(function (glyph) {
      return glyph.unicode > 0xFFFF;
    });

    if (hasGLyphsOver2Bytes) {
      sfnt.support.cmap.hasGLyphsOver2Bytes = hasGLyphsOver2Bytes;

      var unicodes4Bytes = glyfUnicodes;

      sfnt.support.cmap.format12Segments = getSegments(unicodes4Bytes);
      sfnt.support.cmap.format12Size = 16
        + sfnt.support.cmap.format12Segments.length * 12;
    }

    var size = 4 + (hasGLyphsOver2Bytes ? 32 : 24) // cmap header
      + sfnt.support.cmap.format0Size // format 0
      + sfnt.support.cmap.format4Size // format 4
      + (hasGLyphsOver2Bytes ? sfnt.support.cmap.format12Size : 0); // format 12

    return size;
  }
}

export default Cmap;

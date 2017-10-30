import { Table, Reader, Writer, SfntObject, StructTuple, struct } from './_base';
import { GlyphMap, GlyphSupport, Glyph, SubGlyf, Coordinate } from './_interface';

const MAX_INSTRUCTION_LENGTH = 5000; // 设置instructions阈值防止读取错误
const MAX_NUMBER_OF_COORDINATES = 20000; // 设置坐标最大个数阈值，防止glyf读取错误
enum GlyphFlag {
  ONCURVE = 0x01, // on curve ,off curve
  XSHORT = 0x02,  // x-Short Vector
  YSHORT = 0x04,  // y-Short Vector
  REPEAT = 0x08,  // next byte is flag repeat count
  XSAME = 0x10,   // This x is same (Positive x-Short vector)
  YSAME = 0x20,   // This y is same (Positive y-Short vector)
  Reserved1 = 0x40,
  Reserved2 = 0x80
};
enum ComponentFlag {
  ARG_1_AND_2_ARE_WORDS = 0x01,
  ARGS_ARE_XY_VALUES = 0x02,
  ROUND_XY_TO_GRID = 0x04,
  WE_HAVE_A_SCALE = 0x08,
  RESERVED = 0x10,
  MORE_COMPONENTS = 0x20,
  WE_HAVE_AN_X_AND_Y_SCALE = 0x40,
  WE_HAVE_A_TWO_BY_TWO = 0x80,
  WE_HAVE_INSTRUCTIONS = 0x100,
  USE_MY_METRICS = 0x200,
  OVERLAP_COMPOUND = 0x400,
  SCALED_COMPONENT_OFFSET = 0x800,
  UNSCALED_COMPONENT_OFFSET = 0x1000
};

const isEmptyObject = function (object?: Object) {
  if (object) {
    for (let name in object) {
      if (object.hasOwnProperty(name)) return false;
    }
  }
  return true;
}

const parseSimpleGlyf = function (reader: Reader, glyf: Glyph): Glyph {
  let offset = reader.offset;

  // Get number of coordinates
  let endPtsOfContours = <Array<number>>glyf.endPtsOfContours;
  let numberOfCoordinates = endPtsOfContours[endPtsOfContours.length - 1] + 1;
  // Coordinates exceeded max coordinates number
  if (numberOfCoordinates > MAX_NUMBER_OF_COORDINATES) {
    throw new Error('Error read glyf coordinates: ' + offset);
  }

  // Read flags
  let flags = [];
  let i = 0;
  while (i < numberOfCoordinates) {
    let flag = reader.readUint8();
    flags.push(flag);
    i++;

    // 标志位3重复flag
    if ((flag & GlyphFlag.REPEAT) && i < numberOfCoordinates) {
      // number of repeats
      let repeat = reader.readUint8();
      for (let j = 0; j < repeat; j++) {
        flags.push(flag);
        i++;
      }
    }
  }

  // Reads X coordinates
  let coordinatesX: Array<number> = [];
  let prevX = 0;
  for (let flag of flags) {
    let x = 0;

    // Pos 1
    // If set, the corresponding y-coordinate is 1 byte long, not 2
    if (flag & GlyphFlag.XSHORT) { // Pos 5
      x = reader.readUint8();
      x = (flag & GlyphFlag.XSAME) ? x : -1 * x;
    } else if (flag & GlyphFlag.XSAME) { // Same as previous byte
      x = 0;
    } else { // new value
      x = reader.readInt16();
    }

    prevX += x;
    coordinatesX.push(prevX);
  }

  // Reads Y coordinates
  let coordinatesY: Array<number> = [];
  let prevY = 0;
  for (let flag of flags) {
    let y = 0;

    if (flag & GlyphFlag.YSHORT) { // Pos 5
      y = reader.readUint8();
      y = (flag & GlyphFlag.YSAME) ? y : -1 * y;
    } else if (flag & GlyphFlag.YSAME) {
      y = 0;
    } else {
      y = reader.readInt16();
    }

    prevY += y;
    coordinatesY.push(prevY);
  }

  // Compose coordinates
  let coordinates: Array<Coordinate> = [];
  for (let k = 0; k < flags.length; k++) {
    coordinates[k] = {
      x: coordinatesX[k] || 0,
      y: coordinatesY[k] || 0,
    };
    if (flags[k] & GlyphFlag.ONCURVE) {
      coordinates[i].onCurve = true;
    }
  }

  // 计算轮廓集合
  if (coordinates.length) {
    let contours: Array<Array<Coordinate>> = [];

    for (let m = 0; m < endPtsOfContours.length; m++) {
      contours.push(coordinates.slice(
        m === 0 ? 0 : (endPtsOfContours[m - 1] + 1),
        endPtsOfContours[m] + 1)
      );
    }

    glyf.contours = contours;
  }

  return glyf;
}

const parseCompoundGlyf = function (reader: Reader, glyf: Glyph): Glyph {
  glyf.compound = true;
  glyf.glyfs = [];

  let flags;

  // 读取复杂字形
  do {
    flags = reader.readUint16();
    let glyphIndex = reader.readUint16();
    let subGlyf: SubGlyf = { flags, glyphIndex };

    let arg1 = 0;
    let arg2 = 0;
    let scaleX = 16384;
    let scaleY = 16384;
    let scale01 = 0;
    let scale10 = 0;

    if (ComponentFlag.ARG_1_AND_2_ARE_WORDS & subGlyf.flags) {
      arg1 = reader.readInt16();
      arg2 = reader.readInt16();
    } else {
      arg1 = reader.readInt8();
      arg2 = reader.readInt8();
    }

    if (ComponentFlag.ROUND_XY_TO_GRID & subGlyf.flags) {
      arg1 = Math.round(arg1);
      arg2 = Math.round(arg2);
    }

    if (ComponentFlag.WE_HAVE_A_SCALE & subGlyf.flags) {
      scaleX = reader.readInt16();
      scaleY = scaleX;
    } else if (ComponentFlag.WE_HAVE_AN_X_AND_Y_SCALE & subGlyf.flags) {
      scaleX = reader.readInt16();
      scaleY = reader.readInt16();
    } else if (ComponentFlag.WE_HAVE_A_TWO_BY_TWO & subGlyf.flags) {
      scaleX = reader.readInt16();
      scale01 = reader.readInt16();
      scale10 = reader.readInt16();
      scaleY = reader.readInt16();
    }

    if (ComponentFlag.ARGS_ARE_XY_VALUES & subGlyf.flags) {
      subGlyf.useMyMetrics = +!!subGlyf.flags & ComponentFlag.USE_MY_METRICS;
      subGlyf.overlapCompound = +!!subGlyf.flags & ComponentFlag.OVERLAP_COMPOUND;

      subGlyf.transform = {
        a: Math.round(10000 * scaleX / 16384) / 10000,
        b: Math.round(10000 * scale01 / 16384) / 10000,
        c: Math.round(10000 * scale10 / 16384) / 10000,
        d: Math.round(10000 * scaleY / 16384) / 10000,
        e: arg1,
        f: arg2
      };
    } else {
      throw new Error('10202');
    }

    glyf.glyfs.push(subGlyf);
  } while (ComponentFlag.MORE_COMPONENTS & flags);

  if (ComponentFlag.WE_HAVE_INSTRUCTIONS & flags) {
    let length = reader.readUint16();
    if (length > MAX_INSTRUCTION_LENGTH) {
      throw new Error('Glyph length error, exceeded max length');
    }
    glyf.instructions = [];
    for (let i = 0; i < length; i++) {
      glyf.instructions.push(reader.readUint8());
    }
  }

  return glyf;
}

const parse = function (reader: Reader, sfnt: SfntObject, offset?: number): Glyph {

  if (null !== offset) {
    reader.seek(offset);
  }

  let glyf: Glyph = {};

  // Broundaries
  let numberOfContours = reader.readInt16();
  glyf.xMin = reader.readInt16();
  glyf.yMin = reader.readInt16();
  glyf.xMax = reader.readInt16();
  glyf.yMax = reader.readInt16();

  // Reads simple glyph
  if (numberOfContours >= 0) {
    // endPtsOfConturs
    glyf.endPtsOfContours = [];
    for (let i = 0; i < numberOfContours; i++) {
      glyf.endPtsOfContours.push(reader.readUint16());
    }

    // instructions
    length = reader.readUint16();
    if (!length || length > MAX_INSTRUCTION_LENGTH) {
      throw new Error('Glyph length error, either missing or exceeded max length');
    }
    glyf.instructions = [];
    for (let i = 0; i < length; ++i) {
      glyf.instructions.push(reader.readUint8());
    }

    glyf = parseSimpleGlyf(reader, glyf);
    delete glyf.endPtsOfContours;
  } else {
    glyf = parseCompoundGlyf(reader, glyf);
  }

  return glyf;
}

const sizeofSimple = function (glyf: Glyph, glyfSupport: GlyphSupport, hinting: boolean) {

  if (!glyf.contours || 0 === glyf.contours.length) {
    return 0;
  }

  // fixed header + endPtsOfContours
  let result = 12 + glyf.contours.length * 2 + (<Array<number>>glyfSupport.flags).length;

  for (let x of <Array<number>>glyfSupport.xCoord) {
    result += 0 <= x && x <= 0xFF ? 1 : 2;
  };

  for (let y of <Array<number>>glyfSupport.yCoord) {
    result += 0 <= y && y <= 0xFF ? 1 : 2;
  };

  return result + (hinting && glyf.instructions ? glyf.instructions.length : 0);
}

const sizeofCompound = function (glyf: Glyph, hinting: boolean) {
  let size = 10;
  let transform;

  for (let subGlyf of <Array<SubGlyf>>glyf.glyfs) {

    transform = <{a: number, b: number, c: number, d: number, e: number, f: number}>subGlyf.transform;

    // flags + glyfIndex
    size += 4;

    // a, b, c, d, e
    // xy values or points
    if (transform.e < 0 || transform.e > 0x7F || transform.f < 0 || transform.f > 0x7F) {
      size += 4;
    } else {
      size += 2;
    }

    // 01 , 10
    if (transform.b || transform.c) {
      size += 8;
    } else if (transform.a !== 1 || transform.d !== 1) { // scale
      size += transform.a === transform.d ? 2 : 4;
    }

  };

  return size;
}

const getFlags = function(glyf: Glyph, glyfSupport: GlyphSupport) {

  if (!glyf.contours || 0 === glyf.contours.length) {
    return glyfSupport;
  }

  let flags: Array<number>  = [];
  let xCoord: Array<number> = [];
  let yCoord: Array<number>  = [];

  let prev;
  for (let contour of glyf.contours) {
    for (let i = 0; i < contour.length; i++) {

      let point = contour[i];
      if (i === 0) {
        xCoord.push(point.x);
        yCoord.push(point.y);
      } else {
        xCoord.push(point.x - (<Coordinate>prev).x);
        yCoord.push(point.y - (<Coordinate>prev).y);
      }
      flags.push(point.onCurve ? GlyphFlag.ONCURVE : 0);
      prev = point;
    }
  }

  // compress
  let flagsC: Array<number>  = [];
  let xCoordC: Array<number>  = [];
  let yCoordC: Array<number>  = [];
  let prevFlag: number;
  let repeatPoint = -1;

  flags.forEach(function (flag, index) {

    let x = xCoord[index];
    let y = yCoord[index];

    // First flag
    if (index === 0) {

      if (-0xFF <= x && x <= 0xFF) {
        flag += GlyphFlag.XSHORT;
        if (x >= 0) {
          flag += GlyphFlag.XSAME;
        }
        x = Math.abs(x);
      }

      if (-0xFF <= y && y <= 0xFF) {
        flag += GlyphFlag.YSHORT;
        if (y >= 0) {
          flag += GlyphFlag.YSAME;
        }
        y = Math.abs(y);
      }

      prevFlag = flag;
      flagsC.push(flag);
      xCoordC.push(x);
      yCoordC.push(y);

    // Following flags
    } else {

      if (x === 0) {
        flag += GlyphFlag.XSAME;
      } else {
        if (-0xFF <= x && x <= 0xFF) {
          flag += GlyphFlag.XSHORT;
          if (x > 0) {
            flag += GlyphFlag.XSAME;
          }
          x = Math.abs(x);
        }
        xCoordC.push(x);
      }

      if (y === 0) {
        flag += GlyphFlag.YSAME;
      } else {
        if (-0xFF <= y && y <= 0xFF) {
          flag += GlyphFlag.YSHORT;
          if (y > 0) {
            flag += GlyphFlag.YSAME;
          }
          y = Math.abs(y);
        }
        yCoordC.push(y);
      }

      // repeat
      if (flag === prevFlag) {
        // 记录重复个数
        if (-1 === repeatPoint) {
          flagsC[flagsC.length - 1] |= GlyphFlag.REPEAT;
          flagsC.push(1);
        } else {
          ++flagsC[repeatPoint + 1];
        }
      } else {
        repeatPoint = -1;
        flagsC.push(prevFlag = flag);
      }
    }
  });

  glyfSupport.flags = flagsC;
  glyfSupport.xCoord = xCoordC;
  glyfSupport.yCoord = yCoordC;

  return glyfSupport;
}

class Glyf extends Table {
  public name = 'glyf';

  public read(reader: Reader, sfnt: SfntObject) {
    let startOffset = this.offset;
    let loca = sfnt.loca;
    let numGlyphs = sfnt.maxp.valueOf().numGlyphs;
    let glyphs: Array<Glyph> = [];

    reader.seek(startOffset);

    // subset
    let subset = sfnt.readOptions.subset;

    if (subset && subset.length > 0) {
      let subsetMap: GlyphMap = { 0: true }
      let cmap = sfnt.cmap;

      // unicode to index
      Object.keys(cmap).forEach(c => {
        if (subset.indexOf(+c) > -1) {
          subsetMap[cmap[c]] = true;
        }
      });
      sfnt.subsetMap = subsetMap;

      let parsedGlyfMap: GlyphMap = {};
      // parse glpyh recursively, including compund glyphs
      const travels = function (subsetMap: GlyphMap) {
        let newSubsetMap: GlyphMap = {};
        for (let i in subsetMap) {
          parsedGlyfMap[i] = true;
          // Current glyph same as next one, no contours;
          glyphs[i] = (loca[i] === loca[i + 1]) ?
            { contours: [] } :
            parse(reader, sfnt, startOffset + loca[i]);

          if (glyphs[i].compound) {
            (<Array<SubGlyf>>glyphs[i].glyfs).forEach(subGlyf => {
              if (!parsedGlyfMap[subGlyf.glyphIndex]) {
                newSubsetMap[subGlyf.glyphIndex] = true;
              }
            });
          }
        };

        if (!isEmptyObject(newSubsetMap)) {
          travels(newSubsetMap);
        }
      };

      travels(subsetMap);

      return glyphs;
    }

    // resolves first n-1 glyphs
    let i = 0;
    while (i < numGlyphs - 1) {
      // Current glyph same as next one, no contours;
      glyphs[i] = (loca[i] === loca[i + 1]) ?
        { contours: [] } :
        parse(reader, sfnt, startOffset + loca[i]);
      i++;
    }

    // Last glyph
    glyphs[i] = ((sfnt.tables.glyf.length - loca[i]) < 5) ?
      { contours: [] } :
      parse(reader, sfnt, startOffset + loca[i]);

    return glyphs;
  }

  public write(writer: Writer, sfnt: SfntObject) {
    let hinting = sfnt.writeOptions ? sfnt.writeOptions.hinting : false;
    sfnt.glyf.forEach((glyf: Glyph, index: number) => {

      // Ignore empty glyphs
      if (!glyf.compound && (!glyf.contours || 0 === glyf.contours.length)) {
        return;
      }

      // header
      writer.writeInt16(glyf.compound ? -1 : glyf.contours.length);
      writer.writeInt16(glyf.xMin);
      writer.writeInt16(glyf.yMin);
      writer.writeInt16(glyf.xMax);
      writer.writeInt16(glyf.yMax);

      // Compound Glyf
      if (glyf.compound) {

        for (let i = 0; i < glyf.glyfs.length; i++) {

          let flags = ComponentFlag.ARGS_ARE_XY_VALUES
            + ComponentFlag.ROUND_XY_TO_GRID; // xy values

          // more components
          if (i < glyf.glyfs.length - 1) {
            flags += ComponentFlag.MORE_COMPONENTS;
          }

          let subGlyf = glyf.glyfs[i];

          // use my metrics
          flags += subGlyf.useMyMetrics ? ComponentFlag.USE_MY_METRICS : 0;
          // overlap compound
          flags += subGlyf.overlapCompound ? ComponentFlag.OVERLAP_COMPOUND : 0;

          let {a, b, c, d, e, f} = subGlyf.transform;

          // xy values or points
          // Should use Int 16
          if (e < 0 || e > 0x7F || f < 0 || f > 0x7F) {
            flags += ComponentFlag.ARG_1_AND_2_ARE_WORDS;
          }

          if (b || c) {
            flags += ComponentFlag.WE_HAVE_A_TWO_BY_TWO;
          } else {
            if ((a !== 1 || d !== 1) && a === d) {
              flags += ComponentFlag.WE_HAVE_A_SCALE;
            } else if (a !== 1 || d !== 1) {
              flags += ComponentFlag.WE_HAVE_AN_X_AND_Y_SCALE;
            }
          }

          writer.writeUint16(flags);
          writer.writeUint16(subGlyf.glyphIndex);

          if (ComponentFlag.ARG_1_AND_2_ARE_WORDS & flags) {
            writer.writeInt16(e);
            writer.writeInt16(f);
          } else {
            writer.writeUint8(e);
            writer.writeUint8(f);
          }

          if (ComponentFlag.WE_HAVE_A_SCALE & flags) {
            writer.writeInt16(Math.round(a * 16384));
          } else if (ComponentFlag.WE_HAVE_AN_X_AND_Y_SCALE & flags) {
            writer.writeInt16(Math.round(a * 16384));
            writer.writeInt16(Math.round(d * 16384));
          } else if (ComponentFlag.WE_HAVE_A_TWO_BY_TWO & flags) {
            writer.writeInt16(Math.round(a * 16384));
            writer.writeInt16(Math.round(b * 16384));
            writer.writeInt16(Math.round(c * 16384));
            writer.writeInt16(Math.round(d * 16384));
          }
        }
      // Simple Glyf
      } else {
        // End Points of Countours
        let endPtsOfContours = -1;
        for (let contour of glyf.contours) {
          endPtsOfContours += contour.length;
          writer.writeUint16(endPtsOfContours);
        };

        // instruction
        if (hinting && glyf.instructions) {
          var instructions = glyf.instructions;
          writer.writeUint16(instructions.length);
          for (let instruction of instructions) {
            writer.writeUint8(instruction);
          }
        } else {
          writer.writeUint16(0);
        }

        // Flags
        let flags = sfnt.support.glyf[index].flags;
        for (let flag of flags) {
          writer.writeUint8(flag);
        }

        for (let xCoord of sfnt.support.glyf[index].xCoord) {
          if (0 <= xCoord && xCoord <= 0xFF) {
            writer.writeUint8(xCoord);
          } else {
            writer.writeInt16(xCoord);
          }
        }

        for (let yCoord of sfnt.support.glyf[index].yCoord) {
          if (0 <= yCoord && yCoord <= 0xFF) {
            writer.writeUint8(yCoord);
          } else {
            writer.writeInt16(yCoord);
          }
        }
      }

      // Align 4 bytes
      let glyfSize = sfnt.support.glyf[index].glyfSize;

      if (glyfSize % 4) {
        writer.writeEmpty(4 - glyfSize % 4);
      }
    });

    return writer;
  }

  public sizeof(sfnt: SfntObject) {
    sfnt.support.glyf = [];
    let tableSize = 0;
    let hinting = sfnt.writeOptions ? sfnt.writeOptions.hinting : false;
 
    for (let glyf of <Array<Glyph>>sfnt.glyf) {
      var glyfSupport: GlyphSupport = {};
      glyfSupport = glyf.compound ? glyfSupport : getFlags(glyf, glyfSupport);

      let glyfSize = glyf.compound
          ? sizeofCompound(glyf, hinting)
          : sizeofSimple(glyf, glyfSupport, hinting);
      let size = glyfSize;

      // Align to 4 bytes
      if (size % 4) {
        size += 4 - size % 4;
      }

      glyfSupport.glyfSize = glyfSize;
      glyfSupport.size = size;

      sfnt.support.glyf.push(glyfSupport);

      tableSize += size;
    };

    sfnt.support.glyf.tableSize = tableSize;
    // Copy to head
    sfnt.head.indexToLocFormat = tableSize > 65536 ? 1 : 0;

    return sfnt.support.glyf.tableSize;
  }
}
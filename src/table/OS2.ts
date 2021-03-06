import { Table, Reader, Writer, SfntObject, StructTuple, struct } from './_base';
import { Glyph } from './_interface';

const sharedStruct = [
  <StructTuple>['version', struct.Uint16],

  <StructTuple>['xAvgCharWidth', struct.Int16],
  <StructTuple>['usWeightClass', struct.Uint16],
  <StructTuple>['usWidthClass', struct.Uint16],

  <StructTuple>['fsType', struct.Uint16],

  <StructTuple>['ySubscriptXSize', struct.Uint16],
  <StructTuple>['ySubscriptYSize', struct.Uint16],
  <StructTuple>['ySubscriptXOffset', struct.Uint16],
  <StructTuple>['ySubscriptYOffset', struct.Uint16],

  <StructTuple>['ySuperscriptXSize', struct.Uint16],
  <StructTuple>['ySuperscriptYSize', struct.Uint16],
  <StructTuple>['ySuperscriptXOffset', struct.Uint16],
  <StructTuple>['ySuperscriptYOffset', struct.Uint16],

  <StructTuple>['yStrikeoutSize', struct.Uint16],
  <StructTuple>['yStrikeoutPosition', struct.Uint16],

  <StructTuple>['sFamilyClass', struct.Uint16],

  //Panose
  <StructTuple>['bFamilyType', struct.Uint8],
  <StructTuple>['bSerifStyle', struct.Uint8],
  <StructTuple>['bWeight', struct.Uint8],
  <StructTuple>['bProportion', struct.Uint8],
  <StructTuple>['bContrast', struct.Uint8],
  <StructTuple>['bStrokeVariation', struct.Uint8],
  <StructTuple>['bArmStyle', struct.Uint8],
  <StructTuple>['bLetterform', struct.Uint8],
  <StructTuple>['bMidline', struct.Uint8],
  <StructTuple>['bXHeight', struct.Uint8],

  //unicode range
  <StructTuple>['ulUnicodeRange1', struct.Uint32],
  <StructTuple>['ulUnicodeRange2', struct.Uint32],
  <StructTuple>['ulUnicodeRange3', struct.Uint32],
  <StructTuple>['ulUnicodeRange4', struct.Uint32],

  //char 4
  <StructTuple>['achVendID', struct.String, 4],

  <StructTuple>['fsSelection', struct.Uint16],
  <StructTuple>['usFirstCharIndex', struct.Uint16],
  <StructTuple>['usLastCharIndex', struct.Uint16],

  <StructTuple>['sTypoAscender', struct.Int16],
  <StructTuple>['sTypoDescender', struct.Int16],
  <StructTuple>['sTypoLineGap', struct.Int16],

  <StructTuple>['usWinAscent', struct.Uint16],
  <StructTuple>['usWinDescent', struct.Uint16],
  //version 0 above 39

  <StructTuple>['ulCodePageRange1', struct.Uint32],
  <StructTuple>['ulCodePageRange2', struct.Uint32],
  //version 1 above 41

  <StructTuple>['sxHeight', struct.Int16],
  <StructTuple>['sCapHeight', struct.Int16],

  <StructTuple>['usDefaultChar', struct.Uint16],
  <StructTuple>['usBreakChar', struct.Uint16],
  <StructTuple>['usMaxContext', struct.Uint16]
  //version 2,3,4 above 46
];

const extend = function (target: any, ...sources: Array<any>) {
  for (let source of sources) {
    if (!source) {
      continue;
    }

    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
}

class OS2Head extends Table {
  public name = 'os2head';
  protected struct = sharedStruct;
}

class OS2 extends Table {
  public name = 'OS/2';
  protected struct = sharedStruct;

  public read(reader: Reader, sfnt: SfntObject) {
    let format = reader.readUint16(this.offset);
    let struct = this.struct;

    // format2
    if (format === 0) {
      struct = struct.slice(0, 39);
    }
    else if (format === 1) {
      struct = struct.slice(0, 41);
    }

    let tbl = new OS2Head(this.offset).read(reader, sfnt);

    // add properties from other tables
    let os2Fields = {
      ulCodePageRange1: 1,
      ulCodePageRange2: 0,
      sxHeight: 0,
      sCapHeight: 0,
      usDefaultChar: 0,
      usBreakChar: 32,
      usMaxContext: 0
    };

    return extend(os2Fields, tbl);
  }

  public size(sfnt: SfntObject) {

    // update stats from other tables
    // header
    let xMin = 16384;
    let yMin = 16384;
    let xMax = -16384;
    let yMax = -16384;

    // hhea
    let advanceWidthMax = -1;
    let minLeftSideBearing = 16384;
    let minRightSideBearing = 16384;
    let xMaxExtent = -16384;

    // os2 count
    let xAvgCharWidth = 0;
    let usFirstCharIndex = 0x10FFFF;
    let usLastCharIndex = -1;

    // maxp
    let maxPoints = 0;
    let maxContours = 0;
    let maxCompositePoints = 0;
    let maxCompositeContours = 0;
    let maxSizeOfInstructions = 0;
    let maxComponentElements = 0;

    let glyfNotEmpty = 0; // 非空glyf
    let hinting = sfnt.writeOptions ? sfnt.writeOptions.hinting : false;

    // 计算instructions和functiondefs
    if (hinting) {

      if (sfnt.cvt) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sfnt.cvt.length);
      }

      if (sfnt.prep) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sfnt.prep.length);
      }

      if (sfnt.fpgm) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sfnt.fpgm.length);
      }

    }

    sfnt.glyf.forEach((glyf: Glyph, index: number) => {

      // Control Points
      if (glyf.compound) {
        let compositeContours = 0;
        let compositePoints = 0;
        for (let subGlyf of glyf.glyfs) {
          let cGlyf: Glyph = sfnt.glyf[subGlyf.glyphIndex];
          if (!cGlyf) {
            return;
          }
          compositeContours += cGlyf.contours ? cGlyf.contours.length : 0;
          if (cGlyf.contours && cGlyf.contours.length) {
            for (let contour of cGlyf.contours) {
              compositePoints += contour.length;
            };
          }
        };

        maxComponentElements++;
        maxCompositePoints = Math.max(maxCompositePoints, compositePoints);
        maxCompositeContours = Math.max(maxCompositeContours, compositeContours);
      
      // Simople Glyphs
      } else if (glyf.contours && glyf.contours.length) {
        maxContours = Math.max(maxContours, glyf.contours.length);

        var points = 0;
        glyf.contours.forEach(function (contour) { 
          points += contour.length;
        });
        maxPoints = Math.max(maxPoints, points);
      }

      if (hinting && glyf.instructions) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, glyf.instructions.length);
      }

      // 统计边界信息
      if (glyf.compound || glyf.contours && glyf.contours.length) {

        if (<number>glyf.xMin < xMin) {
          xMin = glyf.xMin;
        }

        if (<number>glyf.yMin < yMin) {
          yMin = glyf.yMin;
        }

        if (<number>glyf.xMax > xMax) {
          xMax = glyf.xMax;
        }

        if (<number>glyf.yMax > yMax) {
          yMax = glyf.yMax;
        }

        advanceWidthMax = Math.max(advanceWidthMax, glyf.advanceWidth);
        minLeftSideBearing = Math.min(minLeftSideBearing, glyf.leftSideBearing);
        minRightSideBearing = Math.min(minRightSideBearing, glyf.advanceWidth - glyf.xMax);
        xMaxExtent = Math.max(xMaxExtent, glyf.xMax);

        xAvgCharWidth += glyf.advanceWidth;

        glyfNotEmpty++;
      }

      let unicodes = (typeof glyf.unicode === 'number') ? [glyf.unicode] : glyf.unicode;

      if (Array.isArray(unicodes)) {
        unicodes.forEach(function (unicode) {
          if (unicode !== 0xFFFF) {
            usFirstCharIndex = Math.min(usFirstCharIndex, unicode);
            usLastCharIndex = Math.max(usLastCharIndex, unicode);
          }
        });
      }
    });

    // 重新设置version 4
    sfnt['OS/2'].version = 0x4;
    sfnt['OS/2'].achVendID = (sfnt['OS/2'].achVendID + '    ').slice(0, 4);
    sfnt['OS/2'].xAvgCharWidth = xAvgCharWidth / (glyfNotEmpty || 1);
    sfnt['OS/2'].ulUnicodeRange2 = 268435456;
    sfnt['OS/2'].usFirstCharIndex = usFirstCharIndex;
    sfnt['OS/2'].usLastCharIndex = usLastCharIndex;

    // rewrite hhea
    sfnt.hhea.version = sfnt.hhea.version || 0x1;
    sfnt.hhea.advanceWidthMax = advanceWidthMax;
    sfnt.hhea.minLeftSideBearing = minLeftSideBearing;
    sfnt.hhea.minRightSideBearing = minRightSideBearing;
    sfnt.hhea.xMaxExtent = xMaxExtent;

    // rewrite head
    sfnt.head.version = sfnt.head.version || 0x1;
    sfnt.head.lowestRecPPEM = sfnt.head.lowestRecPPEM || 0x8;
    sfnt.head.xMin = xMin;
    sfnt.head.yMin = yMin;
    sfnt.head.xMax = xMax;
    sfnt.head.yMax = yMax;

    // 这里根据存储的maxp来设置新的maxp，避免重复计算maxp
    sfnt.maxp = sfnt.maxp || {};
    sfnt.support.maxp = {
      version: 1.0,
      numGlyphs: sfnt.glyf.length,
      maxPoints: maxPoints,
      maxContours: maxContours,
      maxCompositePoints: maxCompositePoints,
      maxCompositeContours: maxCompositeContours,
      maxZones: sfnt.maxp.maxZones || 0,
      maxTwilightPoints: sfnt.maxp.maxTwilightPoints || 0,
      maxStorage: sfnt.maxp.maxStorage || 0,
      maxFunctionDefs: sfnt.maxp.maxFunctionDefs || 0,
      maxStackElements: sfnt.maxp.maxStackElements || 0,
      maxSizeOfInstructions: maxSizeOfInstructions,
      maxComponentElements: maxComponentElements,
      maxComponentDepth: maxComponentElements ? 1 : 0
    };

    return super.size(sfnt);
  }
}

export default OS2;

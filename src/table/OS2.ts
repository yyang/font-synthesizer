import { Table, Reader, Writer, SntfObject, StructTuple, struct } from './_base';
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

  public read(reader: Reader, sntf: SntfObject) {
    let format = reader.readUint16(this.offset);
    let struct = this.struct;

    // format2
    if (format === 0) {
      struct = struct.slice(0, 39);
    }
    else if (format === 1) {
      struct = struct.slice(0, 41);
    }

    let tbl = new OS2Head(this.offset).read(reader, sntf);

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

  public size(sntf: SntfObject) {

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
    let hinting = sntf.writeOptions ? sntf.writeOptions.hinting : false;

    // 计算instructions和functiondefs
    if (hinting) {

      if (sntf.cvt) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sntf.cvt.length);
      }

      if (sntf.prep) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sntf.prep.length);
      }

      if (sntf.fpgm) {
        maxSizeOfInstructions = Math.max(maxSizeOfInstructions, sntf.fpgm.length);
      }

    }

    sntf.glyf.forEach((glyf: Glyph, index: number) => {

      // Control Points
      if (glyf.compound) {
        let compositeContours = 0;
        let compositePoints = 0;
        for (let subGlyf of glyf.glyfs) {
          let cGlyf: Glyph = sntf.glyf[subGlyf.glyphIndex];
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

        if (glyf.xMin < xMin) {
          xMin = glyf.xMin;
        }

        if (glyf.yMin < yMin) {
          yMin = glyf.yMin;
        }

        if (glyf.xMax > xMax) {
          xMax = glyf.xMax;
        }

        if (glyf.yMax > yMax) {
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
    sntf['OS/2'].version = 0x4;
    sntf['OS/2'].achVendID = (sntf['OS/2'].achVendID + '    ').slice(0, 4);
    sntf['OS/2'].xAvgCharWidth = xAvgCharWidth / (glyfNotEmpty || 1);
    sntf['OS/2'].ulUnicodeRange2 = 268435456;
    sntf['OS/2'].usFirstCharIndex = usFirstCharIndex;
    sntf['OS/2'].usLastCharIndex = usLastCharIndex;

    // rewrite hhea
    sntf.hhea.version = sntf.hhea.version || 0x1;
    sntf.hhea.advanceWidthMax = advanceWidthMax;
    sntf.hhea.minLeftSideBearing = minLeftSideBearing;
    sntf.hhea.minRightSideBearing = minRightSideBearing;
    sntf.hhea.xMaxExtent = xMaxExtent;

    // rewrite head
    sntf.head.version = sntf.head.version || 0x1;
    sntf.head.lowestRecPPEM = sntf.head.lowestRecPPEM || 0x8;
    sntf.head.xMin = xMin;
    sntf.head.yMin = yMin;
    sntf.head.xMax = xMax;
    sntf.head.yMax = yMax;

    // 这里根据存储的maxp来设置新的maxp，避免重复计算maxp
    sntf.maxp = sntf.maxp || {};
    sntf.support.maxp = {
      version: 1.0,
      numGlyphs: sntf.glyf.length,
      maxPoints: maxPoints,
      maxContours: maxContours,
      maxCompositePoints: maxCompositePoints,
      maxCompositeContours: maxCompositeContours,
      maxZones: sntf.maxp.maxZones || 0,
      maxTwilightPoints: sntf.maxp.maxTwilightPoints || 0,
      maxStorage: sntf.maxp.maxStorage || 0,
      maxFunctionDefs: sntf.maxp.maxFunctionDefs || 0,
      maxStackElements: sntf.maxp.maxStackElements || 0,
      maxSizeOfInstructions: maxSizeOfInstructions,
      maxComponentElements: maxComponentElements,
      maxComponentDepth: maxComponentElements ? 1 : 0
    };

    return super.size(sntf);
  }
}

export default OS2;

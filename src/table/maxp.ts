import {Table, Reader, Writer, SntfObject, struct} from './_base';

class Maxp extends Table {
  public name = 'head';
  protected struct = [
    ['version', struct.Fixed],
    ['numGlyphs', struct.Uint16],
    ['maxPoints', struct.Uint16],
    ['maxContours', struct.Uint16],
    ['maxCompositePoints', struct.Uint16],
    ['maxCompositeContours', struct.Uint16],
    ['maxZones', struct.Uint16],
    ['maxTwilightPoints', struct.Uint16],
    ['maxStorage', struct.Uint16],
    ['maxFunctionDefs', struct.Uint16],
    ['maxInstructionDefs', struct.Uint16],
    ['maxStackElements', struct.Uint16],
    ['maxSizeOfInstructions', struct.Uint16],
    ['maxComponentElements', struct.Uint16],
    ['maxComponentDepth', struct.Int16]
  ];

  public write(writer: Writer, sntf: SntfObject) {
    return super.write(writer, sntf.support);
  }

  public size(sntf?: SntfObject) {
    return 32;
  }
}

export default Maxp;

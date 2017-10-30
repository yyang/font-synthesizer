import {Table, Reader, Writer, SfntObject, struct} from './_base';

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

  public write(writer: Writer, sfnt: SfntObject) {
    return super.write(writer, sfnt.support);
  }

  public size(sfnt?: SfntObject) {
    return 32;
  }
}

export default Maxp;

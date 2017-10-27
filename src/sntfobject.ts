import Writer from './writer';
import Reader from './reader';
import Directory from './table/directory';

interface SntfObjectOptions {
  offset?: number;
  length?: number;
  littleEndian?: boolean;
}

class SntfObject {
  private version: number;
  private searchRange: number;
  private entrySelector: number;
  private rangeShift: number;
  public numTables: number;  
  public tables: any;
  [property: string]: any;

  constructor(buffer: Buffer, type: String, options?: SntfObjectOptions = {}) {
    if (type !== 'ttf') {
      throw new Error('Unsupported SNTF Input Type: ' + type);
    }

    let reader = new Reader(buffer);

    // Reads TTF File
    // * ttf version
    this.version = reader.readFixed(0);
    if (this.version !== 0x1) {
      throw new Error('Invalid TTF Version. TTF file damaged.')
    }
    // * ttf num tables
    this.numTables = reader.readUint16();
    if (this.numTables <= 0 || this.numTables > 100) {
      throw new Error('Insufficient num tables number. TTF File damaged.');
    }

    // * ttf searchRange
    this.searchRange = reader.readUint16();

    // * ttf entrySelector
    this.entrySelector = reader.readUint16();

    // * ttf rangeShift
    this.rangeShift = reader.readUint16();

    // TODO: Directory object
    this.tables = new Directory(options.offset || 0).read(reader, this);
    if (!this.tables.glyf || !this.tables.head || !this.tables.cmap || !this.tables.hmtx) {
      throw new Error('10204')
    }

    this.options = {}

  }

  setSubsetGlyphs(subset) {

  }

  subsetTtfBuffer() {

  }

  subsetWoffBuffer() {

  }

  subsetWoff2Buffer() {

  }

}

export default SntfObject
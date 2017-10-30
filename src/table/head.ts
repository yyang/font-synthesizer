import {Table, Reader, Writer, SfntObject, StructTuple, struct} from './_base';

class Head extends Table {
  public name = 'head';
  protected struct = [
    <StructTuple>['version', struct.Fixed, 0],
    <StructTuple>['fontRevision', struct.Fixed, 0],
    <StructTuple>['checkSumAdjustment', struct.Uint32, 0],
    <StructTuple>['magickNumber', struct.Uint32, 0],
    <StructTuple>['flags', struct.Uint16, 0],
    <StructTuple>['unitsPerEm', struct.Uint16, 0],
    <StructTuple>['created', struct.LongDateTime, 0],
    <StructTuple>['modified', struct.LongDateTime, 0],
    <StructTuple>['xMin', struct.Int16, 0],
    <StructTuple>['yMin', struct.Int16, 0],
    <StructTuple>['xMax', struct.Int16, 0],
    <StructTuple>['yMax', struct.Int16, 0],
    <StructTuple>['macStyle', struct.Uint16, 0],
    <StructTuple>['lowestRecPPEM', struct.Uint16, 0],
    <StructTuple>['fontDirectionHint', struct.Int16, 0],
    <StructTuple>['indexToLocFormat', struct.Int16, 0],
    <StructTuple>['glyphDataFormat', struct.Int16, 0]
  ];
}

export default Head;

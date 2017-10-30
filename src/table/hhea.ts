import {Table, Reader, Writer, SfntObject, StructTuple, struct} from './_base';

class Hhea extends Table {
  public name = 'hhea';
  protected struct = [
    <StructTuple>['version', struct.Fixed, 0],
    <StructTuple>['ascent', struct.Int16, 0],
    <StructTuple>['descent', struct.Int16, 0],
    <StructTuple>['lineGap', struct.Int16, 0],
    <StructTuple>['advanceWidthMax', struct.Uint16, 0],
    <StructTuple>['minLeftSideBearing', struct.Int16, 0],
    <StructTuple>['minRightSideBearing', struct.Int16, 0],
    <StructTuple>['xMaxExtent', struct.Int16, 0],
    <StructTuple>['caretSlopeRise', struct.Int16, 0],
    <StructTuple>['caretSlopeRun', struct.Int16, 0],
    <StructTuple>['caretOffset', struct.Int16, 0],
    <StructTuple>['reserved0', struct.Int16, 0],
    <StructTuple>['reserved1', struct.Int16, 0],
    <StructTuple>['reserved2', struct.Int16, 0],
    <StructTuple>['reserved3', struct.Int16, 0],
    <StructTuple>['metricDataFormat', struct.Int16, 0],
    <StructTuple>['numOfLongHorMetrics', struct.Uint16, 0]
  ];
}

export default Hhea;

export interface GlyphMap {
  [propertyName: number]: any;
}

export interface GlyphSupport {
  flags?: Array<number>;
  xCoord?: Array<number>;
  yCoord?: Array<number>;
  glyfSize?: number;
  size?: number;
}

export interface Glyph {
  contours?: Array<Array<Coordinate>>;
  endPtsOfContours?: Array<number>;
  instructions?: Array<number>;
  compound?: boolean;
  xMin?: number;
  yMin?: number;
  xMax?: number;
  yMax?: number;

  glyfs?: Array<SubGlyf>;
}

export interface SubGlyf {
  flags: number;
  glyphIndex: number;

  useMyMetrics?: number;
  overlapCompound?: number;
  transform?: {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
  }
}

export interface Coordinate {
  x: number;
  y: number;
  onCurve?: boolean;
}

export interface HMetric {
  advanceWidth: number;
  leftSideBearing: number;
}
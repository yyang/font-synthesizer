import fs from 'fs';
import Reader from './reader';
import SntfObject from './sntfobject';

const utils = require('./utils');

class Font {

  public readonly name: string;
  public readonly weight?: number;
  public readonly language: string;

  private sourceFile: Buffer;
  private sntf: SntfObject;

  constructor(name: string, path: string, weight = 400, language = 'en-US') {
    this.name = name;
    this.weight = weight;
    this.language = language;
    this.sourceFile = fs.readFileSync(path);
    this.sntf = new SntfObject(this.sourceFile, 'ttf');
  }

  renderCssSubset(subset: string) {
    

  }

  renderWoffSubset(subset: string) {

  }
}




var font = new Font('Kai Gen Gothic', './KaiGenGothicSC-Light.ttf');

console.log(font);

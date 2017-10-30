import head from './head';
import maxp from './maxp';
import loca from './loca';
import cmap from './cmap';
import glyf from './glyf';
import name from './name';
import hhea from './hhea';
import hmtx from './hmtx';
import post from './post';
import os2 from './OS2';
import fpgm from './fpgm';
import cvt from './cvt';
import prep from './prep';
import gasp from './gasp';

const support = {
  head,
  maxp,
  loca,
  cmap,
  glyf,
  name,
  hhea,
  hmtx,
  post,
  'OS/2': os2,
  fpgm,
  cvt,
  prep,
  gasp
}

export default support;
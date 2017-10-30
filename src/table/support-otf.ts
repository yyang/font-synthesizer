import head from './head';
import maxp from './maxp';
import cmap from './cmap';
import name from './name';
import hhea from './hhea';
import hmtx from './hmtx';
import post from './post';
import os2 from './OS2';
import cff from './CFF';

const support = {
  head,
  maxp,
  cmap,
  name,
  hhea,
  hmtx,
  post,
  'OS/2': os2,
  'CCF': cff
}

export default support;
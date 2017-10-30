import { Table, Reader, Writer, SntfObject, StructTuple, struct } from './_base';

declare var escape: any
declare var unescape: any

const unicodeName = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
  10: 1,
  11: 1,
  12: 1,
  13: 2,
  14: 1,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 1,
  20: 1,
  21: 1,
  22: 1,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 1,
  28: 1,
  29: 1,
  30: 1,
  31: 1,
  32: 3,
  33: 4,
  34: 5,
  35: 6,
  36: 7,
  37: 8,
  38: 9,
  39: 10,
  40: 11,
  41: 12,
  42: 13,
  43: 14,
  44: 15,
  45: 16,
  46: 17,
  47: 18,
  48: 19,
  49: 20,
  50: 21,
  51: 22,
  52: 23,
  53: 24,
  54: 25,
  55: 26,
  56: 27,
  57: 28,
  58: 29,
  59: 30,
  60: 31,
  61: 32,
  62: 33,
  63: 34,
  64: 35,
  65: 36,
  66: 37,
  67: 38,
  68: 39,
  69: 40,
  70: 41,
  71: 42,
  72: 43,
  73: 44,
  74: 45,
  75: 46,
  76: 47,
  77: 48,
  78: 49,
  79: 50,
  80: 51,
  81: 52,
  82: 53,
  83: 54,
  84: 55,
  85: 56,
  86: 57,
  87: 58,
  88: 59,
  89: 60,
  90: 61,
  91: 62,
  92: 63,
  93: 64,
  94: 65,
  95: 66,
  96: 67,
  97: 68,
  98: 69,
  99: 70,
  100: 71,
  101: 72,
  102: 73,
  103: 74,
  104: 75,
  105: 76,
  106: 77,
  107: 78,
  108: 79,
  109: 80,
  110: 81,
  111: 82,
  112: 83,
  113: 84,
  114: 85,
  115: 86,
  116: 87,
  117: 88,
  118: 89,
  119: 90,
  120: 91,
  121: 92,
  122: 93,
  123: 94,
  124: 95,
  125: 96,
  126: 97,
  160: 172,
  161: 163,
  162: 132,
  163: 133,
  164: 189,
  165: 150,
  166: 232,
  167: 134,
  168: 142,
  169: 139,
  170: 157,
  171: 169,
  172: 164,
  174: 138,
  175: 218,
  176: 131,
  177: 147,
  178: 242,
  179: 243,
  180: 141,
  181: 151,
  182: 136,
  184: 222,
  185: 241,
  186: 158,
  187: 170,
  188: 245,
  189: 244,
  190: 246,
  191: 162,
  192: 173,
  193: 201,
  194: 199,
  195: 174,
  196: 98,
  197: 99,
  198: 144,
  199: 100,
  200: 203,
  201: 101,
  202: 200,
  203: 202,
  204: 207,
  205: 204,
  206: 205,
  207: 206,
  208: 233,
  209: 102,
  210: 211,
  211: 208,
  212: 209,
  213: 175,
  214: 103,
  215: 240,
  216: 145,
  217: 214,
  218: 212,
  219: 213,
  220: 104,
  221: 235,
  222: 237,
  223: 137,
  224: 106,
  225: 105,
  226: 107,
  227: 109,
  228: 108,
  229: 110,
  230: 160,
  231: 111,
  232: 113,
  233: 112,
  234: 114,
  235: 115,
  236: 117,
  237: 116,
  238: 118,
  239: 119,
  240: 234,
  241: 120,
  242: 122,
  243: 121,
  244: 123,
  245: 125,
  246: 124,
  247: 184,
  248: 161,
  249: 127,
  250: 126,
  251: 128,
  252: 129,
  253: 236,
  254: 238,
  255: 186,
  262: 253,
  263: 254,
  268: 255,
  269: 256,
  273: 257,
  286: 248,
  287: 249,
  304: 250,
  305: 215,
  321: 226,
  322: 227,
  338: 176,
  339: 177,
  350: 251,
  351: 252,
  352: 228,
  353: 229,
  376: 187,
  381: 230,
  382: 231,
  402: 166,
  710: 216,
  711: 225,
  728: 219,
  729: 220,
  730: 221,
  731: 224,
  733: 223,
  960: 155,
  8211: 178,
  8212: 179,
  8216: 182,
  8217: 183,
  8218: 196,
  8220: 180,
  8221: 181,
  8222: 197,
  8224: 130,
  8225: 194,
  8226: 135,
  8230: 171,
  8240: 198,
  8249: 190,
  8250: 191,
  8355: 247,
  8482: 140,
  8486: 159,
  8706: 152,
  8710: 168,
  8719: 154,
  8721: 153,
  8722: 239,
  8725: 188,
  8729: 195,
  8730: 165,
  8734: 146,
  8747: 156,
  8776: 167,
  8800: 143,
  8804: 148,
  8805: 149,
  9674: 185,
  61441: 192,
  61442: 193,
  64257: 192,
  64258: 193,
  65535: 0 // 0xFFFF points to .notdef
};

const postName = {
  0: '.notdef',
  1: '.null',
  2: 'nonmarkingreturn',
  3: 'space',
  4: 'exclam',
  5: 'quotedbl',
  6: 'numbersign',
  7: 'dollar',
  8: 'percent',
  9: 'ampersand',
  10: 'quotesingle',
  11: 'parenleft',
  12: 'parenright',
  13: 'asterisk',
  14: 'plus',
  15: 'comma',
  16: 'hyphen',
  17: 'period',
  18: 'slash',
  19: 'zero',
  20: 'one',
  21: 'two',
  22: 'three',
  23: 'four',
  24: 'five',
  25: 'six',
  26: 'seven',
  27: 'eight',
  28: 'nine',
  29: 'colon',
  30: 'semicolon',
  31: 'less',
  32: 'equal',
  33: 'greater',
  34: 'question',
  35: 'at',
  36: 'A',
  37: 'B',
  38: 'C',
  39: 'D',
  40: 'E',
  41: 'F',
  42: 'G',
  43: 'H',
  44: 'I',
  45: 'J',
  46: 'K',
  47: 'L',
  48: 'M',
  49: 'N',
  50: 'O',
  51: 'P',
  52: 'Q',
  53: 'R',
  54: 'S',
  55: 'T',
  56: 'U',
  57: 'V',
  58: 'W',
  59: 'X',
  60: 'Y',
  61: 'Z',
  62: 'bracketleft',
  63: 'backslash',
  64: 'bracketright',
  65: 'asciicircum',
  66: 'underscore',
  67: 'grave',
  68: 'a',
  69: 'b',
  70: 'c',
  71: 'd',
  72: 'e',
  73: 'f',
  74: 'g',
  75: 'h',
  76: 'i',
  77: 'j',
  78: 'k',
  79: 'l',
  80: 'm',
  81: 'n',
  82: 'o',
  83: 'p',
  84: 'q',
  85: 'r',
  86: 's',
  87: 't',
  88: 'u',
  89: 'v',
  90: 'w',
  91: 'x',
  92: 'y',
  93: 'z',
  94: 'braceleft',
  95: 'bar',
  96: 'braceright',
  97: 'asciitilde',
  98: 'Adieresis',
  99: 'Aring',
  100: 'Ccedilla',
  101: 'Eacute',
  102: 'Ntilde',
  103: 'Odieresis',
  104: 'Udieresis',
  105: 'aacute',
  106: 'agrave',
  107: 'acircumflex',
  108: 'adieresis',
  109: 'atilde',
  110: 'aring',
  111: 'ccedilla',
  112: 'eacute',
  113: 'egrave',
  114: 'ecircumflex',
  115: 'edieresis',
  116: 'iacute',
  117: 'igrave',
  118: 'icircumflex',
  119: 'idieresis',
  120: 'ntilde',
  121: 'oacute',
  122: 'ograve',
  123: 'ocircumflex',
  124: 'odieresis',
  125: 'otilde',
  126: 'uacute',
  127: 'ugrave',
  128: 'ucircumflex',
  129: 'udieresis',
  130: 'dagger',
  131: 'degree',
  132: 'cent',
  133: 'sterling',
  134: 'section',
  135: 'bullet',
  136: 'paragraph',
  137: 'germandbls',
  138: 'registered',
  139: 'copyright',
  140: 'trademark',
  141: 'acute',
  142: 'dieresis',
  143: 'notequal',
  144: 'AE',
  145: 'Oslash',
  146: 'infinity',
  147: 'plusminus',
  148: 'lessequal',
  149: 'greaterequal',
  150: 'yen',
  151: 'mu',
  152: 'partialdiff',
  153: 'summation',
  154: 'product',
  155: 'pi',
  156: 'integral',
  157: 'ordfeminine',
  158: 'ordmasculine',
  159: 'Omega',
  160: 'ae',
  161: 'oslash',
  162: 'questiondown',
  163: 'exclamdown',
  164: 'logicalnot',
  165: 'radical',
  166: 'florin',
  167: 'approxequal',
  168: 'Delta',
  169: 'guillemotleft',
  170: 'guillemotright',
  171: 'ellipsis',
  172: 'nonbreakingspace',
  173: 'Agrave',
  174: 'Atilde',
  175: 'Otilde',
  176: 'OE',
  177: 'oe',
  178: 'endash',
  179: 'emdash',
  180: 'quotedblleft',
  181: 'quotedblright',
  182: 'quoteleft',
  183: 'quoteright',
  184: 'divide',
  185: 'lozenge',
  186: 'ydieresis',
  187: 'Ydieresis',
  188: 'fraction',
  189: 'currency',
  190: 'guilsinglleft',
  191: 'guilsinglright',
  192: 'fi',
  193: 'fl',
  194: 'daggerdbl',
  195: 'periodcentered',
  196: 'quotesinglbase',
  197: 'quotedblbase',
  198: 'perthousand',
  199: 'Acircumflex',
  200: 'Ecircumflex',
  201: 'Aacute',
  202: 'Edieresis',
  203: 'Egrave',
  204: 'Iacute',
  205: 'Icircumflex',
  206: 'Idieresis',
  207: 'Igrave',
  208: 'Oacute',
  209: 'Ocircumflex',
  210: 'apple',
  211: 'Ograve',
  212: 'Uacute',
  213: 'Ucircumflex',
  214: 'Ugrave',
  215: 'dotlessi',
  216: 'circumflex',
  217: 'tilde',
  218: 'macron',
  219: 'breve',
  220: 'dotaccent',
  221: 'ring',
  222: 'cedilla',
  223: 'hungarumlaut',
  224: 'ogonek',
  225: 'caron',
  226: 'Lslash',
  227: 'lslash',
  228: 'Scaron',
  229: 'scaron',
  230: 'Zcaron',
  231: 'zcaron',
  232: 'brokenbar',
  233: 'Eth',
  234: 'eth',
  235: 'Yacute',
  236: 'yacute',
  237: 'Thorn',
  238: 'thorn',
  239: 'minus',
  240: 'multiply',
  241: 'onesuperior',
  242: 'twosuperior',
  243: 'threesuperior',
  244: 'onehalf',
  245: 'onequarter',
  246: 'threequarters',
  247: 'franc',
  248: 'Gbreve',
  249: 'gbreve',
  250: 'Idotaccent',
  251: 'Scedilla',
  252: 'scedilla',
  253: 'Cacute',
  254: 'cacute',
  255: 'Ccaron',
  256: 'ccaron',
  257: 'dcroat'
};

const stringify = function (str?: string) {
  if (!str) {
    return str;
  }

  var newStr = '';
  for (let i = 0; i < str.length; i++) {
    let ch = str.charCodeAt(i);
    if (ch === 0) {
        continue;
    }
    newStr += String.fromCharCode(ch);
  }
  return newStr;
}

const string = {
  stringify,

  /**
   * 将双字节编码字符转换成`\uxxxx`形式
   */
  escape: function (str: string) {
    if (!str) {
      return str;
    }
    return String(str).replace(/[\uff-\uffff]/g, c => escape(c).replace('%', '\\'));
  },

  /**
   * 将双字节编码字符转换成`\uxxxx`形式
   */
  getString: function (bytes: Array<number>): string {
    let s = '';
    for (let byte of bytes) {
      s += String.fromCharCode(byte);
    }
    return s;
  },

  /**
   * 获取unicode的名字值
   */
  getUnicodeName: function (unicode: number): string {
    let unicodeNameIndex = (<any>unicodeName)[unicode];
    if (undefined !== unicodeNameIndex) {
      return (<any>postName)[unicodeNameIndex];
    }
    return 'uni' + unicode.toString(16).toUpperCase();
  },

  /**
   * 转换成utf8的字节数组
   */
  toUTF8Bytes: function (str: string): Array<number> {
    str = stringify(str);
    let byteArray = [];
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) <= 0x7F) {
        byteArray.push(str.charCodeAt(i));
      } else {
        let h = encodeURIComponent(str.charAt(i)).slice(1).split('%');
        for (let char of h) {
          byteArray.push(parseInt(char, 16));
        }
      }
    }
    return byteArray;
  },

  /**
   * 转换成usc2的字节数组
   */
  toUCS2Bytes: function (str: string): Array<number> {
    str = stringify(str);
    let byteArray = [];

    for (let i = 0; i < str.length; i++) {
      let ch = str.charCodeAt(i);
      byteArray.push(ch >> 8);
      byteArray.push(ch & 0xFF);
    }

    return byteArray;
  },


  /**
   * 获取pascal string 字节数组
   */
  toPascalStringBytes: function (str: string): Array<number> {
    let bytes = [];
    let length = str ? (str.length < 256 ? str.length : 255) : 0;
    bytes.push(length);

    for (let i = 0; i < str.length; i++) {
      let ch = str.charCodeAt(i);
      // non-ASCII characters are substituted with '*'
      bytes.push(ch < 128 ? ch : 42);
    }

    return bytes;
  },

  /**
   * utf8字节转字符串
   */
  getUTF8String: function (bytes: Array<number>): string {
    let str = '';
    for (let byte of bytes) {
      if (byte < 0x7F) {
        str += String.fromCharCode(byte);
      } else {
        str += '%' + (256 + byte).toString(16).slice(1);
      }
    }

    return unescape(str);
  },

  /**
   * ucs2字节转字符串
   */
  getUCS2String: function (bytes: Array<number>): string {
    let str = '';
    for (let i = 0; i < bytes.length; i += 2) {
      str += String.fromCharCode((bytes[i] << 8) + bytes[i + 1]);
    }
    return str;
  },

  /**
   * 读取 pascal string
   */
  getPascalString: function (byteArray: Array<number>): Array<string> {
    let strArray = [];
    let i = 0;
    let length = byteArray.length;

    while (i < length) {
      let strLength = byteArray[i++];
      let str = '';

      while (strLength-- > 0 && i < length) {
        str += String.fromCharCode(byteArray[i++]);
      }
      str = stringify(str);
      strArray.push(str);
    }

    return strArray;
  }
};

class Posthead extends Table {
  public name = 'posthead';

  protected struct = [
    <StructTuple>['format', struct.Fixed],
    <StructTuple>['italicAngle', struct.Fixed],
    <StructTuple>['underlinePosition', struct.Int16],
    <StructTuple>['underlineThickness', struct.Int16],
    <StructTuple>['isFixedPitch', struct.Uint32],
    <StructTuple>['minMemType42', struct.Uint32],
    <StructTuple>['maxMemType42', struct.Uint32],
    <StructTuple>['minMemType1', struct.Uint32],
    <StructTuple>['maxMemType1', struct.Uint32]
  ];
}

class Post extends Table {
  public name = 'post';

  public read(reader: Reader, sntf: SntfObject) {
    let format = reader.readFixed(this.offset);
    // reads header
    let table = new Posthead(this.offset).read(reader, sntf);

    // format2
    if (format === 2) {
      var numberOfGlyphs = reader.readUint16();
      var glyphNameIndex = [];

      for (var i = 0; i < numberOfGlyphs; ++i) {
        glyphNameIndex.push(reader.readUint16());
      }

      var pascalStringOffset = reader.offset;
      var pascalStringLength = sntf.tables.post.length - (pascalStringOffset - this.offset);
      var pascalStringBytes = reader.readBytes(reader.offset, pascalStringLength);

      table.nameIndex = glyphNameIndex; // 设置glyf名字索引
      table.names = string.getPascalString(pascalStringBytes); // glyf名字数组
    }
    // deprecated
    else if (format === 2.5) {
      table.format = 3;
    }

    return table;
  }

  public write(writer: Writer, sntf: SntfObject) {
    var post = sntf.post || {
      format: 3
    };

    // write header
    writer.writeFixed(post.format); // format
    writer.writeFixed(post.italicAngle || 0); // italicAngle
    writer.writeInt16(post.underlinePosition || 0); // underlinePosition
    writer.writeInt16(post.underlineThickness || 0); // underlineThickness
    writer.writeUint32(post.isFixedPitch || 0); // isFixedPitch
    writer.writeUint32(post.minMemType42 || 0); // minMemType42
    writer.writeUint32(post.maxMemType42 || 0); // maxMemType42
    writer.writeUint32(post.minMemType1 || 0); // minMemType1
    writer.writeUint32(post.maxMemType1 || 0); // maxMemType1

    // version 3 不设置post信息
    if (post.format === 2) {
      var numberOfGlyphs = sntf.glyf.length;
      writer.writeUint16(numberOfGlyphs); // numberOfGlyphs
      // write glyphNameIndex
      var nameIndex = sntf.support.post.nameIndex;
      for (var i = 0, l = nameIndex.length; i < l; i++) {
        writer.writeUint16(nameIndex[i]);
      }

      // write names
      for (let name of sntf.support.post.names) {
        writer.writeBytes(name);
      }
    }

    return writer;
  }

  public size(sntf: SntfObject) {

    var numberOfGlyphs = sntf.glyf.length;
    sntf.post = sntf.post || {};
    sntf.post.format = sntf.post.format || 3;
    sntf.post.maxMemType1 = numberOfGlyphs;

    // version 3 不设置post信息
    if (sntf.post.format === 3 || sntf.post.format === 1) {
      return 32;
    }

    // version 2
    var size = 34 + numberOfGlyphs * 2; // header + numberOfGlyphs + numberOfGlyphs * 2
    var glyphNames = [];
    var nameIndexArr = [];
    var nameIndex = 0;

    // 获取 name的大小
    for (var i = 0; i < numberOfGlyphs; i++) {
      // .notdef
      if (i === 0) {
        nameIndexArr.push(0);
      }
      else {
        var glyf = sntf.glyf[i];
        var unicode = glyf.unicode ? glyf.unicode[0] : 0;
        var unicodeNameIndex = (<any>unicodeName)[unicode];
        if (undefined !== unicodeNameIndex) {
          nameIndexArr.push(unicodeNameIndex);
        }
        else {
          // 这里需要注意，"" 有可能是"\3" length不为0，但是是空字符串
          var name = glyf.name;
          if (!name || name.charCodeAt(0) < 32) {
            nameIndexArr.push(258 + nameIndex++);
            glyphNames.push([0]);
            size++;
          }
          else {
            nameIndexArr.push(258 + nameIndex++);
            var bytes = string.toPascalStringBytes(name); // pascal string bytes
            glyphNames.push(bytes);
            size += bytes.length;
          }
        }
      }
    }

    sntf.support.post = {
      nameIndex: nameIndexArr,
      names: glyphNames
    };

    return size;
  }
}

export default Post;

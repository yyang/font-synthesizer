Font Synthesizer
========================================

This particular project is re-written from [kekee000/fonteditor-core](https://github.com/kekee000/fonteditor-core) in TypeScript, with the following concerns:

- Embraces TypeScript world and avoids using Baidu EDP framework, so as to ease the process of forking and hacking original package.
- Implements a few shorthands to cache glyphs. Such shorthands will further eliminate the need of computation while composing new SFNT subsets, thus makes realtime font subsetting available.

## Feature

## Font Server

## Other Usage

## Related Projects

* [ynakajima/ttf.js](https://github.com/ynakajima/ttf.js): A nice TTF reader.
* [kekee000/fonteditor-core](https://github.com/kekee000/fonteditor-core): The very first JS based SFNT parser and writer.
* [ecomfe/fontmin](https://github.com/ecomfe/fontmin): Font subset tool.
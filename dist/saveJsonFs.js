"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _writeFile = require("./writeFile");

/**
 * Keys are the file names and the values are the content. For data url saves the binary data.
 * 
 * Something like this:
 * 
 * { 'thumbnail.jpg': 'data:image/jpg;base64, ... }
 * 
 */
async function _default(jsonFs) {
  for (let fileName in jsonFs) {
    await _writeFile.writeFile.call(this, fileName, jsonFs[fileName]);
  }
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _mimeTypes = require("mime-types");

function _default(data, fileName) {
  const buf = Buffer.from(data, 'binary');
  const mimeType = (0, _mimeTypes.lookup)(fileName);
  const isText = mimeType.indexOf('text') === 0;
  const encoding = isText ? 'utf-8' : 'base64';
  const string = buf.toString(encoding);
  const result = `data:${mimeType};${encoding},${string}`;
  return result;
}
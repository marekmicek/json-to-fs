"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(data) {
  const encoding = 'utf-8';
  const buf = Buffer.from(data, encoding);
  const string = buf.toString(encoding);
  const result = JSON.parse(string);
  return result;
}
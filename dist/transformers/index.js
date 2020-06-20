"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "asDataURL", {
  enumerable: true,
  get: function () {
    return _asDataURL.default;
  }
});
Object.defineProperty(exports, "asText", {
  enumerable: true,
  get: function () {
    return _asText.default;
  }
});
Object.defineProperty(exports, "asJSON", {
  enumerable: true,
  get: function () {
    return _asJSON.default;
  }
});
exports.default = void 0;

var _asDataURL = _interopRequireDefault(require("./asDataURL"));

var _asText = _interopRequireDefault(require("./asText"));

var _asJSON = _interopRequireDefault(require("./asJSON"));

var _mimeTypes = require("mime-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (data, fileName) => {
  const mimeType = (0, _mimeTypes.lookup)(fileName);
  const isText = mimeType.indexOf('text') === 0;
  const isJSON = mimeType === 'application/json';

  if (isJSON) {
    return (0, _asJSON.default)(data, fileName);
  }

  return isText ? (0, _asText.default)(data, fileName) : (0, _asDataURL.default)(data, fileName);
};

exports.default = _default;
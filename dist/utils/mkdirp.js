"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mkdirp;

var _path = _interopRequireDefault(require("path"));

var _util = _interopRequireDefault(require("util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function mkdirp(p, mode, fs) {
  const mkdir = _util.default.promisify(fs.mkdir);

  let doesExist = await new Promise(resolve => fs.exists(p, exists => resolve(exists)));

  if (!doesExist) {
    await mkdirp(_path.default.dirname(p), mode, fs);
  }

  doesExist = await new Promise(resolve => fs.exists(p, exists => resolve(exists)));

  if (!doesExist) {
    await mkdir(p, mode);
  }
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ensurePathExists;

var _mkdirp = _interopRequireDefault(require("./mkdirp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ensurePathExists(path) {
  const {
    fs
  } = this;
  return new Promise(async resolve => {
    await fs;
    fs.stat(path, async (err, stats) => {
      if (!stats) {
        await (0, _mkdirp.default)(path, 777, fs);
      }

      resolve();
    });
  });
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

async function _default(path) {
  const {
    fs
  } = this;
  return await new Promise((resolve, reject) => {
    fs.lstat(path, (err, data) => {
      if (err) {
        if (err.code === 'ENOTDIR') {
          resolve(false);
          return;
        }

        reject(err);
        return;
      }

      resolve(data.isDirectory());
    });
  });
}
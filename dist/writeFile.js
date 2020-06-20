"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = _interopRequireDefault(require("path"));

var _ensurePathExists = _interopRequireDefault(require("./utils/ensurePathExists"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prepareContent = content => {
  if ((content === null || content === void 0 ? void 0 : content.indexOf('data:')) === 0) {
    // convert to buffer
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = content.match(regex);

    if (matches) {
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      return buffer;
    }
  }

  return content;
};

async function _default(fileName, content) {
  const {
    fs
  } = this;
  await _ensurePathExists.default.bind(this)(_path.default.dirname(fileName));
  await new Promise((resolve, reject) => {
    fs.writeFile(fileName, prepareContent(content), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}
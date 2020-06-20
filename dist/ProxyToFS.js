"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ongoing = void 0;

var _writeFile = _interopRequireDefault(require("./writeFile"));

var _readFile = _interopRequireDefault(require("./readFile"));

var _readDir = _interopRequireDefault(require("./readDir"));

var _isDir = _interopRequireDefault(require("./isDir"));

var _removeFile = _interopRequireDefault(require("./removeFile"));

var handlers = _interopRequireWildcard(require("./handlers"));

var transformers = _interopRequireWildcard(require("./transformers"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ongoing = [];
exports.ongoing = ongoing;
let $promise;

const mapToValue = path => {
  const name = path.split('/').slice(-2, -1)[0];

  if (name in handlers) {
    return {
      path,
      handle: handlers[name]
    };
  }

  if (name in transformers) {
    return {
      path: path.split('/').slice(0, -2).join('/'),
      transform: transformers[name]
    };
  }

  return {
    path,
    transform: transformers.default
  };
};

const handleReadDir = async (fs, path) => {
  return await _readDir.default.bind({
    fs
  })(path);
};

const handleReadFile = async (fs, path) => {
  const mapped = mapToValue(path);
  const {
    transform,
    handle
  } = mapped;

  if (handle) {
    return await handle(mapped.path);
  } else {
    const buffer = await _readFile.default.bind({
      fs
    })(mapped.path);
    const result = await transform(buffer, mapped.path);
    return result;
  }
};

class ProxyToFS {
  constructor({
    fs,
    path,
    context = {},
    onRead,
    onWrite,
    onDelete
  }) {
    let self;

    if (path.slice(-1) !== '/') {
      throw new Error(`path must end with a '/'`);
    }

    return self = new Proxy(this, {
      set: (object, key, value) => {
        const promise = (async () => {
          if (onWrite) {
            const write = await onWrite({
              path: path,
              name: key,
              value
            });

            if (write) {
              return;
            }
          }

          if (typeof value === 'object') {
            const dirProxy = new ProxyToFS({
              fs,
              path: path + key + '/',
              context,
              onRead,
              onWrite,
              onDelete
            });

            for (const item in value) {
              dirProxy[item] = value[item];
            }
          } else if (typeof value === 'string') {
            await _writeFile.default.bind({
              fs
            })(path + key, value);
          }
        })();

        ongoing.push(promise);
        return true;
      },
      get: (object, key) => {
        if (object[key]) {
          return object[key];
        }

        if (key === '$proxy') {
          return self;
        }

        if (key === '$promise') {
          $promise = Promise.all(ongoing);
          return $promise;
        }

        if (key === 'then') {
          if (this.$listing) {
            return;
          }

          const fn = async () => {
            await Promise.all(ongoing);

            if (onRead) {
              const read = await onRead({
                path
              });

              if (read) {
                return read;
              }
            }

            const isDir_ = await _isDir.default.bind({
              fs
            })(path);

            if (isDir_) {
              const $listing = await handleReadDir(fs, path);
              this.$listing = $listing;
              return self;
            }

            return await handleReadFile(fs, path);
          };

          const promise = fn();
          return promise.then.bind(promise);
        } else {
          if (key === '$listing') {
            return;
          }

          if (typeof key === 'symbol') {
            return;
          }

          return new ProxyToFS({
            fs,
            path: path + key + '/',
            context,
            onRead,
            onWrite,
            onDelete
          });
        }
      },
      deleteProperty: (object, key) => {
        if (onDelete) {
          const handled = onDelete({
            path,
            name: key
          });

          if (handled) {
            return true;
          }
        }

        const operation = async () => await _removeFile.default.bind({
          fs
        })(path + key);

        ongoing.push(operation());
        return true;
      },
      ownKeys: object => {
        return this.$listing;
      },
      getOwnPropertyDescriptor: function (target, key) {
        return {
          value: target[key],
          enumerable: true,
          writable: true,
          configurable: true
        };
      }
    });
  }

  async toJson() {
    const object = {};
    const content = await this;

    if (!content.$listing) {
      return content;
    }

    for (const item in content) {
      object[item] = await this[item].toJson();
    }

    return object;
  }

}

exports.default = ProxyToFS;
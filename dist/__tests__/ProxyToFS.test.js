"use strict";

var _util = _interopRequireDefault(require("util"));

var BrowserFS = _interopRequireWildcard(require("browserfs"));

var _ProxyToFS = _interopRequireDefault(require("../ProxyToFS"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const textData = 'This is a text file';

const setupFS = async () => {
  const context = {};
  BrowserFS.install(context);
  await new Promise(resolve => {
    // Configures BrowserFS to use the LocalStorage file system.
    BrowserFS.configure({
      fs: 'InMemory'
    }, function (e) {
      if (e) {
        throw e;
      }

      resolve();
    });
  });

  const fs = context.require('fs');

  const mkdir = _util.default.promisify(fs.mkdir);

  const writeFile = _util.default.promisify(fs.writeFile);

  await mkdir('/file');
  await writeFile('/file/content.md', Buffer.from(textData));
  await writeFile('/file/image.png', Buffer.from(imageDataUrl.split(',')[1], 'base64'));
  return fs;
};

it('should read the text file correctly', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  expect(await store.file['content.md'].asText).toEqual(textData);
});
it('should read the image file correctly', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  expect(await store.file['image.png'].asDataURL).toEqual(imageDataUrl);
});
it('should allow to write files by Object.assign', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  const newFiles = {
    file: {
      'new-content.md': 'This is another file'
    }
  };
  Object.assign(store, newFiles);
  await store.$promise;
  expect(await store.file['new-content.md'].asText).toEqual(newFiles.file['new-content.md']);
});
it('should allow to add a new text file', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  const textContent = 'The new content file';
  const fileName = '/file/content-new.md';
  store.file['content-new.md'] = textContent;
  await store.file['content-new.md'].$promise;
  const buffer = await _util.default.promisify(fs.readFile)(fileName);
  const actual = buffer.toString('utf-8');
  const expected = textContent;
  expect(actual).toBe(expected);
});
it('should allow to remove a file', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  const existingFileName = 'file/content.md';

  const stat = _util.default.promisify(fs.stat);

  const checkIfExists = async () => {
    try {
      return !!(await stat(existingFileName));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }

      throw err;
    }
  };

  expect(await checkIfExists()).toBe(true);
  delete store.file['content.md'];
  await store;
  expect(await checkIfExists()).toBe(false);
});
it('should generate proper json file', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  const actual = await store.toJson();
  const expected = {
    file: {
      'content.md': textData,
      'image.png': imageDataUrl
    }
  };
  expect(actual).toStrictEqual(expected);
});
it('should list the files', async () => {
  const fs = await setupFS();
  const store = new _ProxyToFS.default({
    fs,
    path: '/'
  });
  const expected = ['content.md', 'image.png'];
  const actual = Object.keys(await store.file);
  expect(actual).toStrictEqual(expected);
});
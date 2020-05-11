import util from 'util';
import * as BrowserFS from 'browserfs';
import ProxyToFS from '../ProxyToFS';

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

    const mkdir = util.promisify(fs.mkdir);
    const writeFile = util.promisify(fs.writeFile);

    await mkdir('/file');
    await writeFile('/file/content.md', Buffer.from(textData));
    await writeFile('/file/image.png', Buffer.from(imageDataUrl.split(',')[1], 'base64'));

    return fs;
};

it('should read the text file correctly', async () => {
    const fs = await setupFS();

    const store = new ProxyToFS({ fs, path: '/' });

    expect(await store.file['content.md'].asString).toEqual(textData);
});

it('should read the image file correctly', async () => {
    const fs = await setupFS();

    const store = new ProxyToFS({ fs, path: '/' });

    expect(await store.file['image.png'].asDataURL).toEqual(imageDataUrl);
});

it('should allow to write files by Object.assign', async () => {
    const fs = await setupFS();

    const store = new ProxyToFS({ fs, path: '/' });

    const newFiles = {
        file: {
            'new-content.md': 'This is another file'
        }
    };

    Object.assign(store, newFiles);

    await store.$promise;

    expect(await store.file['new-content.md'].asString).toEqual(newFiles.file['new-content.md']);
});

it('should allow to add a new text file', async () => {
    const fs = await setupFS();

    const store = new ProxyToFS({ fs, path: '/' });

    const textContent = 'The new content file'

    const fileName = '/file/content-new.md';
    store.file['content-new.md'] = textContent;

    await store.file['content-new.md'].$promise;

    const buffer = await util.promisify(fs.readFile)(fileName);

    const actual = buffer.toString('utf-8');
    const expected = textContent;

    expect(actual).toBe(expected);
});

it('should allow to remove a file', async () => {
    const fs = await setupFS();
    const store = new ProxyToFS({ fs, path: '/' });

    const existingFileName = 'file/content.md';
    const stat = util.promisify(fs.stat);

    const checkIfExists = async () => {
        try {
            return !!await stat(existingFileName)
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }

            throw err;
        }
    };

    expect(await checkIfExists()).toBe(true);

    delete store.file['content.md'];

    await store.$promise;

    expect(await checkIfExists()).toBe(false);
});

it('should generate proper json file', async () => {
    const fs = await setupFS();
    const store = new ProxyToFS({ fs, path: '/' });

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
    const store = new ProxyToFS({ fs, path: '/' });

    const expected = ['content.md', 'image.png'];
    const actual = Object.keys(store.file);

    expect(actual).toStrictEqual(expected);
});

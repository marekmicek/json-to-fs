import util from 'util';
import * as BrowserFS from 'browserfs';

import JsonToFs from 'json-to-fs';

BrowserFS.install(global);

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

const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const textData = 'This is a text file';

const saveFiles = async fs => {

    const mkdir = util.promisify(fs.mkdir);
    const writeFile = util.promisify(fs.writeFile);
    
    await mkdir('/file');
    await writeFile('/file/content.md', Buffer.from(textData));
    await writeFile('/file/image.png', Buffer.from(imageDataUrl.split(',')[1], 'base64'));
};

it('should generate proper json file when stringified', async () => {
    await saveFiles(fs);

    const store = new JsonToFs(fs);

    JSON.stringify(await store.json);
});

it('should list the files', async () => {

    const store = new JsonToFs(fs);

    const expected = ['/file/content.md', '/file/image.png'];
    const actual = Object.keys(store);

    expect(actual).toStrictEqual(expected);
});

it('should allow to add a new text file', async () => {
    const store = new JsonToFs(fs);

    const fileName = '/file/content-new.md';
    store[fileName] = 'The new content file';

    await store[fileName].$promise;

    const buffer = await promisify(fs.readFile(fileName));

    const expected = buffer.toString('utf-8');

    expect(actual).toBe(expected);
});

it('should allow to add a new binary file with data url', async () => {
});

it('should allow to add a new binary file with blob', async () => {
});

it('should allow to remove a file', async () => {
    const store = new JsonToFs(fs);

    delete store['/file/content.md'];
});

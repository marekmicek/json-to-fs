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
        'new-content.md': 'This is another file'
    };

    Object.assign(store, newFiles);

    expect(await store.file['new-content.md'].asString).toEqual(newFiles['new-content.md']);
});

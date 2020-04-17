import mkdirp from './mkdirp';

export default function ensurePathExists(path) {
    const { fs } = this;

    return new Promise(async resolve => {
        await fs;

        fs.stat(path, async (err, stats) => {
            if (!stats) {
                await mkdirp(path, 777, fs);
            }

            resolve();
        });
    });
}

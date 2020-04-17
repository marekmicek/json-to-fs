import path from 'path';
import util from 'util';

export default async function mkdirp(p, mode, fs) {
    const mkdir = util.promisify(fs.mkdir);

    let doesExist = await new Promise(resolve => fs.exists(p, exists => resolve(exists)));

    if (!doesExist) {
        await mkdirp(path.dirname(p), mode, fs);
    }

    doesExist = await new Promise(resolve => fs.exists(p, exists => resolve(exists)));

    if (!doesExist) {
        await mkdir(p, mode);
    }
}

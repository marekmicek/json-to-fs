import writeFile from './writeFile';
import readFile from './readFile';

import * as transformers from './transformers';

const mapToValue = path => {
    const transformerName = path.split('/').slice(-2, -1)[0];

    if (transformerName in transformers) {
        return {
            fileName: path.split('/').slice(0, -2).join('/'),
            transform: transformers[transformerName]
        }
    }

    return {
        fileName: path,
        transform: x => x
    }
};

export default class ProxyToFS {
    constructor({ fs, path, context = {} }) {
        if (path.slice(-1) !== '/') {
            throw new Error(`path must end with a '/'`);
        }

        return new Proxy(this, {
            set: (object, key, value) => {
                if (typeof value === 'object') {
                    const dirProxy = new ProxyToFS({ fs, path: path + key + '/', context })

                    for (const item in value) {
                        dirProxy[item] = value[item];
                    }
                } else if (typeof value === 'string') {
                    writeFile.bind({ fs })(this.path + key, value);
                }

                return true;
            },
            get: (object, key) => {
                if (key === 'then') {
                    const { fileName, transform } = mapToValue(path);
                    const readFilePromise = readFile.bind({ fs })(fileName)
                    .then(buffer => {
                        return transform(buffer, fileName);
                    });

                    return readFilePromise.then.bind(readFilePromise);
                } else {
                    return new ProxyToFS({ fs, path: path + key + '/', context});
                }
            }
        })
    }
}

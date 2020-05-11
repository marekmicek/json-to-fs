import writeFile from './writeFile';
import readFile from './readFile';

import * as handlers from './handlers';
import * as transformers from './transformers';
import removeFile from './removeFile';

let ongoing = [];
let $promise;

const mapToValue = path => {
    const name = path.split('/').slice(-2, -1)[0];

    if (name in handlers) {
        return {
            fileName: path,
            handle: handlers[name]
        }
    }

    if (name in transformers) {
        return {
            fileName: path.split('/').slice(0, -2).join('/'),
            transform: transformers[name]
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
                const promise = (async () => {
                    if (typeof value === 'object') {
                        const dirProxy = new ProxyToFS({ fs, path: path + key + '/', context })

                        for (const item in value) {
                            dirProxy[item] = value[item];
                        }
                    } else if (typeof value === 'string') {
                        await writeFile.bind({ fs })(path + key, value);
                    }
                })();

                ongoing.push(promise);

                return true;
            },
            get: (object, key) => {
                if (object[key]) {
                    return object[key];
                }

                if (key === '$promise') {
                    $promise = Promise.all(ongoing);

                    return $promise;
                }

                if (key === 'then') {
                    const { fileName, transform, handle } = mapToValue(path);
                    if (handle) {
                        const handlePromise = handle(fileName);
                        return handlePromise.then.bind(handlePromise);
                    } else {
                        const readFilePromise = readFile.bind({ fs })(fileName)
                            .then(buffer => {
                                return transform(buffer, fileName);
                            });

                        return readFilePromise.then.bind(readFilePromise);
                    }
                } else {
                    return new ProxyToFS({ fs, path: path + key + '/', context });
                }
            },
            deleteProperty: (object, key) => {
                const operation = async () => await removeFile.bind({ fs })(path + key);
                ongoing.push(operation());

                return true;
            },
            ownKeys: object => {
                throw new Error('not implemented');
            },
            getOwnPropertyDescriptor: function (target, key) {
                return {
                    value: target[key],
                    enumerable: true,
                    writable: true,
                    configurable: true
                };
            }
        })
    }

    async toJson() {
        throw new Error('not implemented');
    }
}

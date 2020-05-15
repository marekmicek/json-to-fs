import writeFile from './writeFile';
import readFile from './readFile';
import readDir from './readDir';
import isDir from './isDir';
import removeFile from './removeFile';

import * as handlers from './handlers';
import * as transformers from './transformers';

let ongoing = [];
let $promise;

const mapToValue = path => {
    const name = path.split('/').slice(-2, -1)[0];

    if (name in handlers) {
        return {
            path,
            handle: handlers[name]
        }
    }

    if (name in transformers) {
        return {
            path: path.split('/').slice(0, -2).join('/'),
            transform: transformers[name]
        }
    }

    return {
        path,
        transform: transformers.default
    }
};

const handleReadDir = async (fs, path) => {
    return await readDir.bind({ fs })(path);
}

const handleReadFile = async (fs, path) => {
    const mapped = mapToValue(path);
    const { transform, handle } = mapped;

    if (handle) {
        return await handle(mapped.path);
    } else {
        const buffer = await readFile.bind({ fs })(mapped.path);
        const result = await transform(buffer, mapped.path);

        return result;
    }
};

export default class ProxyToFS {
    constructor({ fs, path, context = {} }) {
        let self;

        if (path.slice(-1) !== '/') {
            throw new Error(`path must end with a '/'`);
        }

        return self = new Proxy(this, {
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
                        const isDir_ = await isDir.bind({ fs })(path);

                        if (isDir_) {
                            const $listing = await handleReadDir(fs, path);
                            this.$listing = $listing;

                            return self;
                        }

                        return await handleReadFile(fs, path);
                    }

                    const promise = fn();

                    return promise.then.bind(promise);
                } else {
                    if (key === '$listing') {
                        return;
                    }

                    return new ProxyToFS({ fs, path: path + key + '/', context });
                }
            },
            deleteProperty: (object, key) => {
                const operation = async () => await removeFile.bind({ fs })(path + key);
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
        })
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

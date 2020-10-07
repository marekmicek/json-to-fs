import writeFile from './writeFile';
import readFile from './readFile';
import readDir from './readDir';
import isDir from './isDir';
import removeFile from './removeFile';

import * as handlers from './handlers';
import * as transformers from './transformers';

export const ongoing = [];
let $promise;

const setPending = async (path, action, fn) => {
    const item = { path, action };

    if (!ongoing.length) {
        item.promise = fn();
        ongoing.push(item); 
    } else {
        await Promise.all(ongoing.map(x => x.promise));
        ongoing.length = 0;
        item.promise = fn();
        ongoing.push(item);
    }
}

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
    constructor({ fs, path, context = {}, onRead, onWrite, onDelete }) {
        let self;

        if (path.slice(-1) !== '/') {
            path += '/';
        }

        return self = new Proxy(this, {
            set: (object, key, value) => {
                const saveAsync = async () => {
                    if (onWrite) {
                        const write = await onWrite({ path: path, name: key, value });

                        if (write) {
                            return;
                        }
                    }

                    if (typeof value === 'object') {
                        const dirProxy = new ProxyToFS({ fs, path: path + key + '/', context, onRead, onWrite, onDelete })

                        for (const item in value) {
                            dirProxy[item] = value[item];
                        }
                    } else if (typeof value === 'string') {
                        await writeFile.bind({ fs })(path + key, value, 'utf8');
                    }
                };

                setPending(path + key, 'set', saveAsync);

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
                    $promise = Promise.all(ongoing.map(x => x.promise));

                    return $promise;
                }

                if (key === 'then') {
                    if (this.$listing) {
                        return;
                    }

                    const fn = async () => {
                        await Promise.all(ongoing.map(x => x.promise));

                        if (onRead) {
                            const read = await onRead({ path });

                            if (read) {
                                return read;
                            }
                        }

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

                    if (typeof key === 'symbol') {

                        return;
                    }

                    return new ProxyToFS({ fs, path: path + key + '/', context, onRead, onWrite, onDelete });
                }
            },
            deleteProperty: (object, key) => {

                if (onDelete) {
                    const handled = onDelete({ path, name: key });

                    if (handled) {
                        return true;
                    }
                }

                const operation = async () => await removeFile.bind({ fs })(path + key);
                ongoing.push({
                    path: path + key,
                    action: 'delete',
                    promise: operation()
                });

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

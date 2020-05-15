export default async function (path) {
    const { fs } = this;

    return await new Promise((resolve, reject) => {
        fs.lstat(path, (err, data) => {
            if (err) {


                if (err.code === 'ENOTDIR') {
                    resolve(false);
                    return;
                }

                reject(err);

                return;
            }

            resolve(data.isDirectory());
        });
    });
}

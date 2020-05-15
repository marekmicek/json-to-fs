export default async function (path) {
    const { fs } = this;

    return await new Promise((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            if (err) {
                reject(err);

                return;
            }

            resolve(data);
        });
    });
}

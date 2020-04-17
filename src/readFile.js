export default async function (fileName) {
    const { fs } = this;

    return await new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                reject(err);

                return;
            }

            resolve(data);
        });
    });
}

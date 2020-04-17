import path from 'path';
import ensurePathExists from './utils/ensurePathExists';

const prepareContent = content => {

    if (content?.indexOf('data:') === 0) {
        // convert to buffer
        const regex = /^data:.+\/(.+);base64,(.*)$/;

        const matches = content.match(regex);

        if (matches) {
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');

            return buffer;
        }
    }

    return content;
}

export default async function (fileName, content) {

    const { fs } = this;

    await ensurePathExists.bind(this)(path.dirname(fileName));

    await new Promise((resolve, reject) => {
        fs.writeFile(fileName, prepareContent(content), err => {
            if (err) {
                reject(err);

                return;
            }

            resolve();
        });
    });
}

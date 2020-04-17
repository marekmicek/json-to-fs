import { writeFile } from './writeFile';

/**
 * Keys are the file names and the values are the content. For data url saves the binary data.
 * 
 * Something like this:
 * 
 * { 'thumbnail.jpg': 'data:image/jpg;base64, ... }
 * 
 */
export default async function (jsonFs) {

    for (let fileName in jsonFs) {
        await writeFile.call(this, fileName, jsonFs[fileName]);
    }
}

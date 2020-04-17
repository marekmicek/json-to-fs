import { lookup } from 'mime-types';

export default function (data, fileName) {
    const buf = Buffer.from(data, 'binary');
    
    const mimeType = lookup(fileName);

    const isText = mimeType.indexOf('text') === 0;
    const encoding = isText ? 'utf-8' : 'base64'

    const string = buf.toString(encoding);

    const result = `data:${mimeType};${encoding},${string}`;

    return result;
}

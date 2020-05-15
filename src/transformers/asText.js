export default function (data) {
    const buf = Buffer.from(data, 'binary');

    const encoding = 'utf-8'
    const string = buf.toString(encoding);

    return string;
}

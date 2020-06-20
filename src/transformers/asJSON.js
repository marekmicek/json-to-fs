export default function (data) {
    const encoding = 'utf-8'

    const buf = Buffer.from(data, encoding);
    const string = buf.toString(encoding);

    const result = JSON.parse(string);

    return result;
}

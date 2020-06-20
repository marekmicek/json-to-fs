import asDataURL from './asDataURL';
import asText from './asText';
import asJSON from './asJSON';

export { asDataURL, asText, asJSON };

import { lookup } from 'mime-types';

export default (data, fileName) => {
    const mimeType = lookup(fileName);
    const isText = mimeType.indexOf('text') === 0;
    const isJSON = mimeType === 'application/json';

    if (isJSON) {
        return asJSON(data, fileName);
    }

    return isText ? asText(data, fileName) : asDataURL(data, fileName);
}

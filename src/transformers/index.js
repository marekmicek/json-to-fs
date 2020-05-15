import asDataURL from './asDataURL';
import asText from './asText';

export { asDataURL, asText };

import { lookup } from 'mime-types';

export default (data, fileName) => {    
    const mimeType = lookup(fileName);
    const isText = mimeType.indexOf('text') === 0;

    return isText ? asText(data, fileName) : asDataURL(data, fileName);
}

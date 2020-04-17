## Description

Bindings for `fs` module that allows you to manipulate files as they were a properties of an object.

``` javascript
import JsonToFs from 'json-to-fs';
import fs from 'fs'; // or NodeJS fs module or BrowserFS

const store = new JsonToFs(fs);

JSON.stringify(store);

{
    "/files/content.md": "This is a sample text content",
    "/files/image.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
}

```
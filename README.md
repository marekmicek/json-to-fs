[![CircleCI](https://circleci.com/gh/marekmicek/proxy-to-fs.svg?style=shield)](https://circleci.com/gh/marekmicek/proxy-to-fs)

## Description

The way of accessing the File System as close as possible to manipulating JS object. Implemented using Proxy.

``` javascript
import ProxyToFS from 'proxy-to-fs';
import fs from 'fs'; // or NodeJS fs module or BrowserFS
```

### Reading files

``` javascript
// create story by providing fs module and the path where it will be mounted
const store = new ProxyToFS({ fs, path: '/' });

// read the text file
const textContent = await store.directory['content.md'].asString;

// alternatively you can provide the entire path
const theSameTextContent = await store['directory/content.md'].asString;

// read the binary file as a data: URL
const dataURL = await store.directory['image.png'].asDataURL;
```

### Writing files

``` javascript
// write text to a file
store.directory['content-new.md'] = 'New text content';

// wait for the all the operations to finish (like saving the file)
await store;
```

``` javascript
// bulk write
Object.assign(store, {
    directory: {
        'file1.txt': 'Content of a file1',
        'file2.txt': 'Content of a file2'
    }
});
```

### Removing files

``` javascript
// delete a file
delete store.directory['content.md'];

...

await store;
```

### Removing directory and its contents

``` javascript
// delete directory and its content
delete store.directory;

...

await store;
```

### Reading directory content

``` javascript
// iterating over directory items
for (const item in store.directory) {

}
```

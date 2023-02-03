# simple-chunk-reader

Simple, buffered, chunk-by-chunk file reader with customizable buffer size.

## Install

```sh
npm install simple-chunk-reader
```

```sh
yarn add simple-chunk-reader
```

## Usage

```js
const ChunkReader = require("simple-chunk-reader");

const filePath = "./somefile.txt";
const chunkSize = 1024;
const encoding = 'utf-8'; // null for no encoding
const reader = new ChunkReader(filePath, chunkSize, encoding);

let content = "";
while (!reader.isDone) {
  content += reader.read();
}
```

## API

The module exports the following functions:

- [constructor](#constructor)
- [read](#read)
- [readMultiple](#readmultiple)
- [close](#close)j

### constructor

- `new ChunkReader(path: string, size: number, encoding: string): ChunkReader`

| Parameter |  Type  | Description                                                 |
| --------- | :----: | ----------------------------------------------------------- |
| path      | string | The path or location of your file                           |
| size      | number | Chunk/buffer size in bytes, default: 1024 (1 kB)            |
| encoding  | string | Encoding method to use when calling read(), default 'utf-8' |

### read

- `read(): string`

It returns a next chunk of current file stream.

Syntax:

```js
const ChunkReader = require("simple-chunk-reader");

const filePath = "./file.txt";
const chunkSize = 8;
const encoding = 'ascii';
const reader = new ChunkReader(filePath, chunkSize, encoding);

while (!reader.isDone) {
  console.log(reader.read());
}
```

`./file.txt`

```txt
aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo
```

Output:

```bash
aaaabbbb
ccccdddd
eeeeffff
gggghhhh
iiiijjjj
kkkkllll
mmmmnnnn
oooo
```

### readMultiple

- `readMultiple(total: number): string[]`

It returns a next multiple chunk of current file stream.

Syntax:

```js
const ChunkReader = require("simple-chunk-reader");

const filePath = "./file.txt";
const chunkSize = 8;
const reader = new ChunkReader(filePath, chunkSize);

while (!reader.isDone) {
  console.log(reader.readMultiple(3));
}
```

`./file.txt`

```txt
aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo
```

Output:

```bash
['aaaabbbb', 'ccccdddd', 'eeeeffff']
['gggghhhh', 'iiiijjjj', 'kkkkllll']
['mmmmnnnn', 'oooo']
```

### close

- `close(): void`

Close the current file descriptor thereby clearing the file stream that is associated with it.

You need to call this method only if you are done before reading the whole content stream. `read()` and `readMutiple()` will call this function automatically when reaching the end of the stream.

Syntax:

```js
const ChunkReader = require("simple-chunk-reader");

const filePath = "./file.txt";
const chunkSize = 8;
const reader = new ChunkReader(filePath, chunkSize);

console.log(reader.readMultiple(2));
console.log(reader.readMultiple(4));
console.log(reader.read());

reader.close();
```

`./file.txt`

```txt
aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo
```

Output:

```bash
['aaaabbbb', 'ccccdddd']
['eeeeffff', 'gggghhhh', 'iiiijjjj', 'kkkkllll']
mmmmnnnn
```

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

#### in TypeScript

```ts
import ChunkReader from "simple-chunk-reader";

const filePath = "./somefile.txt";
const chunkSize = 1024;
const reader = new ChunkReader(filePath, chunkSize);

let content = "";
while (!reader.isDone) {
  content += reader.read();
}
```

#### in JavaScript

```js
var ChunkReader = require("simple-chunk-reader").default;

var filePath = "./somefile.txt";
var chunkSize = 1024;
var reader = new ChunkReader(filePath, chunkSize);

var content = "";
while (!reader.isDone) {
  content += reader.read();
}
```

## API

The module exports the following functions:

- [`constructor`](#constructor)
- [`read`](#read)
- [`readMultiple`](#readMultiple)

### constructor

- `new ChunkReader(path: string, size: number): ChunkReader`

| Parameter |  Type  | Description                                      |
| --------- | :----: | ------------------------------------------------ |
| path      | string | The path or location of your file                |
| size      | number | Chunk/buffer size in bytes, default: 1024 (1 kB) |

Syntax:

```ts
import ChunkReader from "simple-chunk-reader";

const reader = new ChunkReader("./file.txt", 65536);
```

### read

- `read(): string`

It returns a next chunk of current file stream.

Syntax:

```ts
import ChunkReader from "simple-chunk-reader";

const reader = new ChunkReader("./file.txt", 8);

console.log(reader.read());
console.log(reader.read());
console.log(reader.read());
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
```

### readMultiple

- `readMultiple(total: number): string[]`

It returns a next multiple chunk of current file stream.

Syntax:

```ts
import ChunkReader from "simple-chunk-reader";

const reader = new ChunkReader("./file.txt", 8);

console.log(reader.readMultiple(2));
console.log(reader.readMultiple(4));
```

`./file.txt`

```txt
aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo
```

Output:

```bash
['aaaabbbb', 'ccccdddd']
['eeeeffff', 'gggghhhh', 'iiiijjjj', 'kkkkllll']
```

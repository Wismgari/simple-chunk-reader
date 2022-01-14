import * as fs from "fs";

class ChunkReader {
  private fileDescriptor?: number;

  public filePath: string;
  public bufferSize: number;
  public bytesLength: number;
  public bytesRead: number;
  public isDone: boolean;
  public readCount: number;

  constructor(path: string, bufferSize = 1024) {
    this.filePath = path;
    this.bufferSize = bufferSize;
    this.bytesLength = 0;
    this.bytesRead = 0;
    this.readCount = 0;
    this.isDone = false;
  }

  private readNext() {
    let buffer = Buffer.alloc(this.bufferSize);

    if (!this.fileDescriptor) {
      this.open();
    }

    const bytesRead = fs.readSync(this.fileDescriptor, buffer, {
      length: this.bufferSize,
      position: this.bytesRead,
    });

    if (bytesRead < this.bufferSize) {
      buffer = buffer.slice(0, bytesRead);
    }

    return buffer;
  }

  private open() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File is not found: ${this.filePath}`);
    }

    if (this.fileDescriptor) return;

    this.fileDescriptor = fs.openSync(this.filePath, "r");
    this.bytesLength = fs.statSync(this.filePath).size;
    this.isDone = this.bytesLength === this.bytesRead;
  }

  public close() {
    fs.closeSync(this.fileDescriptor);
    this.isDone = true;
  }

  public read() {
    if (this.isDone) {
      throw new Error(`Entire bytes in file has been read`);
    }

    const data = this.readNext();

    this.bytesRead += data.length;
    this.readCount += 1;

    if (this.bytesRead === this.bytesLength) {
      this.close();
    }

    return data.toString("utf-8");
  }

  public readMultiple(total: number) {
    if (total < 1) {
      throw new RangeError("Total read should be positive number");
    }

    const chunks: string[] = [];

    for (let i = 0; i < total; i++) {
      if (this.isDone) {
        break;
      }

      chunks.push(this.read());
    }

    return chunks;
  }
}

export default ChunkReader;

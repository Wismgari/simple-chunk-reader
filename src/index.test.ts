import { jest } from "@jest/globals";
import * as fs from "fs";

const ChunkReader = require("./");

jest.setTimeout(10000);

const inputPath = "./input.test";

beforeAll(() => {
  fs.closeSync(fs.openSync(inputPath, "w"));
});

afterAll(() => {
  fs.unlinkSync(inputPath);
});

describe("Single Reading Test", () => {
  it("should be able to read a whole data file", async () => {
    const fileSize = 120;
    const chunkSize = 100;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    while (inputReader.isDone === false) {
      dataRead += inputReader.read();
    }

    expect(inputReader.isDone).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / chunkSize));
    expect(dataRead).toBe(inputData);
  });

  it("should be able to read a empty data file", async () => {
    const fileSize = 0;
    const chunkSize = 100;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    while (inputReader.isDone === false) {
      dataRead += inputReader.read();
    }

    expect(inputReader.isDone).toBe(true);
    expect(inputReader.readCount).toBe(1);
    expect(dataRead).toBe(inputData);
  });

  it("should be able to read a whole data file less than chunk size", async () => {
    const fileSize = 65;
    const chunkSize = 100;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    while (inputReader.isDone === false) {
      dataRead += inputReader.read();
    }

    expect(inputReader.isDone).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / chunkSize));
    expect(dataRead).toBe(inputData);
  });

  it("should be able to read a whole big data file", async () => {
    const fileSize = getBytes(500, "mb");
    const chunkSize = getBytes(25, "mb");
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    while (inputReader.isDone === false) {
      dataRead += inputReader.read();
    }

    expect(inputReader.isDone).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / chunkSize));
    expect(dataRead).toBe(inputData);
  });
});

describe("Multi Reading Test", () => {
  it("should be able to read a whole data file with multiple method", async () => {
    const fileSize = 120;
    const chunkSize = 9;
    const multiTotal = 5;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    let multiCount = 0;
    let arraySize = 0;
    while (inputReader.isDone === false) {
      const chunks = inputReader.readMultiple(multiTotal);
      dataRead += chunks.join("");
      arraySize += chunks.length;
      multiCount++;
    }

    expect(inputReader.isDone).toBe(true);
    expect(inputReader.readCount).toBe(Math.ceil(fileSize / chunkSize));
    expect(multiCount).toBe(Math.ceil(fileSize / chunkSize / multiTotal));
    expect(arraySize).toBe(Math.ceil(fileSize / chunkSize));
    expect(dataRead).toBe(inputData);
  });

  it("should be more efficient in duration rather than single read", async () => {
    const processChunkMock = async (chunk: string) => {
      await wait(chunk.length / getBytes(1, "kb"));
      return true;
    };
    const fileSize = getBytes(2, "mb");
    const chunkSize = getBytes(30, "kb");
    const multiTotal = 5;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader1 = new ChunkReader(inputPath, chunkSize);
    const timer1 = new Timer();
    let total1 = 0;

    timer1.start();
    while (inputReader1.isDone === false) {
      const chunks = inputReader1.readMultiple(multiTotal);
      const results = await Promise.all(chunks.map(processChunkMock));

      total1 += results.length;
    }
    timer1.stop();

    const inputReader2 = new ChunkReader(inputPath, chunkSize);
    const timer2 = new Timer();
    let total2 = 0;

    timer2.start();
    while (inputReader2.isDone === false) {
      const chunk = await inputReader2.read();
      await processChunkMock(chunk);
      total2++;
    }
    timer2.stop();

    expect(total1).toBe(total2);
    expect(timer1.getDuration()).toBeLessThan(timer2.getDuration());
    expect(timer1.getDuration()).toBeLessThan(timer2.getDuration() / 2);
  });
});

describe("Error Handling", () => {
  it("should throw error when file is not found", () => {
    const reader = new ChunkReader("./undefined", 100);
    expect(() => reader.read()).toThrowError("File is not found");
  });

  it("should throw error when read on done reader", async () => {
    const fileSize = 120;
    const chunkSize = 100;
    const inputData = "0".repeat(fileSize);

    fs.writeFileSync(inputPath, inputData);

    const inputReader = new ChunkReader(inputPath, chunkSize);

    let dataRead = "";
    while (inputReader.isDone === false) {
      dataRead += inputReader.read();
    }

    expect(inputReader.isDone).toBe(true);
    expect(() => inputReader.read()).toThrowError(
      "Entire bytes in file has been read"
    );
  });
});

class Timer {
  duration: number;
  started?: bigint;

  constructor(duration = 0) {
    this.duration = duration;
  }

  private calculateNow() {
    return this.started
      ? Number(process.hrtime.bigint() - this.started) / 1e6
      : 0;
  }

  public getDuration() {
    return this.duration + this.calculateNow();
  }

  public start() {
    if (this.started !== undefined) {
      throw new Error("Unable to start active timer");
    }

    this.started = process.hrtime.bigint();
  }

  public stop() {
    if (this.started === undefined) {
      throw new Error("No active timer");
    }

    this.duration += this.calculateNow();

    this.started = undefined;
  }

  public reset() {
    this.started = undefined;
    this.duration = 0;
  }
}

const wait = async (ms: number) => await new Promise((r) => setTimeout(r, ms));

const getBytes = (num: number, unit: "kb" | "mb" | "gb") => {
  return (
    num *
    (unit === "kb"
      ? 1024
      : unit === "mb"
      ? 1024 * 1024
      : unit === "gb"
      ? 1024 * 1024 * 1024
      : 0)
  );
};

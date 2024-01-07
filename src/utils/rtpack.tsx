import pako from "pako";
import ImageV2 from "imagescript/v2/framebuffer";
import { RTPACK, RTTXTR } from "../types";

function u8ToDataview(u8: Uint8Array) {
  const chunk = new ArrayBuffer(u8.byteLength);
  const view = new DataView(chunk);
  for (let i = 0; i < chunk.byteLength; i++) {
    view.setUint8(i, u8[i]);
  }
  return view;
}

function getLowestPowerOf2(n: number) {
  let lowest = 1;
  while (lowest < n) lowest <<= 1;
  return lowest;
}

export class RTTEX {
  public image: DataView;
  public type: string | undefined;

  constructor(image: DataView) {
    if (!ArrayBuffer.isView(image)) throw new Error("Please use buffer instead.");
    const type = new TextDecoder("utf-8").decode(image.buffer.slice(0, 6));
    if (type === "RTPACK" || type === "RTTXTR") {
      // e
    } else throw new Error("File header must be a RTPACK or RTTXTR");

    this.image = image;
    this.type = type;
  }

  public parseRTPACK(): RTPACK {
    if (this.type !== "RTPACK") throw new TypeError("Invalid type of RTPACK");
    const type = new TextDecoder("utf-8").decode(this.image.buffer.slice(0, 6));

    const data: RTPACK = {
      type,
      version: this.image.getUint8(6),
      reserved: this.image.getUint8(7),
      compressedSize: this.image.getInt32(8, true),
      decompressedSize: this.image.getInt32(12, true),
      compressionType: this.image.getUint8(16),
      reserved2: new Int8Array(16)
    };

    for (let i = 17; i <= 31; i++) {
      data.reserved2[i - 17] = this.image.getUint8(i);
    }

    return data;
  }

  public parseRTTXTR(): RTTXTR {
    let img = this.image;

    if (this.type === "RTPACK") {
      img = new DataView(pako.inflate(this.image.buffer.slice(32)).buffer);
    }

    const type = new TextDecoder("utf-8").decode(img.buffer.slice(0, 6));

    if (type !== "RTTXTR") throw new TypeError("Invalid type of RTTXTR");

    const data: RTTXTR = {
      type,
      version: img.getUint8(6),
      reserved: img.getUint8(7),
      width: img.getInt32(8, true),
      height: img.getInt32(12, true),
      format: img.getInt32(16, true),
      originalWidth: img.getInt32(20, true),
      originalHeight: img.getInt32(24, true),
      isAlpha: img.getUint8(28),
      isCompressed: img.getUint8(29),
      reservedFlags: img.getUint16(30, true),
      mipmap: {
        width: img.getInt32(100, true),
        height: img.getInt32(104, true),
        bufferLength: img.getInt32(108, true),
        count: img.getInt32(32, true)
      },
      reserved2: new Int32Array(16)
    };

    let pos = 36;
    for (let i = 0; i < 16; i++) {
      data.reserved2[i] = img.getInt32(pos, true);
      pos += 4;
    }

    return data;
  }

  public static async hash(buf: Buffer): Promise<number> {
    let hash = 0x55555555;
    buf.forEach((x) => (hash = (hash >>> 27) + (hash << 5) + x));
    return hash >>> 0;
  }

  public static async decode(rttexImg: DataView) {
    let data = rttexImg;

    if (!ArrayBuffer.isView(data)) throw new Error("Please use buffer instead.");

    let type = new TextDecoder("utf-8").decode(data.buffer.slice(0, 6));

    if (type === "RTPACK") {
      data = new DataView(pako.inflate(data.buffer.slice(32)).buffer);
      type = new TextDecoder("utf-8").decode(data.buffer.slice(0, 6));
    }

    if (type === "RTTXTR") {
      return u8ToDataview(
        new ImageV2(data.getUint16(12, true), data.getUint16(8, true), data.buffer.slice(124))
          .flip("vertical")
          .encode("png")
      );
    } else throw new Error("Invalid format type.");
  }

  public static async encode(img: DataView) {
    if (!ArrayBuffer.isView(img)) throw new Error("Please use buffer instead.");

    const type = new TextDecoder("utf-8").decode(img.buffer.slice(0, 6));

    if (type === "RTPACK" || type === "RTTXTR")
      throw new TypeError("Invalid format, must be a PNG");

    const data = ImageV2.decode("png", img).flip("vertical");

    // const rttex = Buffer.alloc(124);
    const rttex = new DataView(new ArrayBuffer(124));
    let pos = 8;

    // write header string
    const rttxtr = new Uint8Array(6);
    rttxtr.set(new TextEncoder().encode("RTTXTR"), 0);
    rttxtr.forEach((v, i) => rttex.setUint8(v, i));

    rttex.setUint8(6, 0); // version
    rttex.setUint8(7, 0); // reserved

    rttex.setInt32(pos, getLowestPowerOf2(data.height), true); // width
    pos += 4;
    rttex.setInt32(pos, getLowestPowerOf2(data.width), true); // height
    pos += 4;
    rttex.setInt32(pos, 5121, true); // format
    pos += 4;
    rttex.setInt32(pos, data.height, true); // originalWidth
    pos += 4;
    rttex.setInt32(pos, data.width, true); // originalHeight
    pos += 4;

    rttex.setUint8(pos, 1); // isAlpha?
    pos += 1;

    rttex.setUint8(pos, 0); // isCompressed?
    pos += 1;

    rttex.setUint16(pos, 1, true); // reservedFlags
    pos += 2;

    rttex.setInt32(pos, 1, true); // mipmapCount
    pos += 4;

    // reserved (17)
    for (let i = 0; i < 16; i++) {
      rttex.setInt32(pos, 0, true);
      pos += 4;
    }

    rttex.setInt32(pos, data.height, true); // mipmapHeight
    pos += 4;
    rttex.setInt32(pos, data.width, true); // mipmapWidth
    pos += 4;
    rttex.setInt32(pos, data.u8.length, true); // bufferLength

    const concat = new Uint8Array(rttex.buffer.byteLength + data.u8.byteLength);
    concat.set(new Uint8Array(rttex.buffer), 0);
    concat.set(data.u8, rttex.buffer.byteLength);

    const compressed = pako.deflate(concat);

    const rtpack = new DataView(new ArrayBuffer(32));
    pos = 8;

    const rtpackHeader = new Uint8Array(6);
    rtpackHeader.set(new TextEncoder().encode("RTPACK"), 0);
    rtpackHeader.forEach((v, i) => rtpack.setUint8(v, i));

    rtpack.setUint8(6, 1); // version
    rtpack.setUint8(7, 1); // reserved

    rtpack.setUint32(pos, compressed.length, true); // compressedSize
    pos += 4;
    rtpack.setUint32(pos, 124 + data.u8.length, true); // decompressedSize
    pos += 4;

    rtpack.setUint8(pos, 1); // compressionType
    pos += 1;

    // reserved (16)
    for (let i = 0; i < 15; i++) {
      rtpack.setUint8(pos, 0);
      pos += 1;
    }

    const result = new Uint8Array(rtpack.buffer.byteLength + compressed.byteLength);
    result.set(new Uint8Array(rtpack.buffer), 0);
    result.set(compressed, rtpack.buffer.byteLength);

    return result;
  }
}

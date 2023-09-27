/** @type {ArrayBuffer | null} */
let file;
let fileJsonString;

const btn = document.getElementById("decode");
const decodeDownload = document.getElementById("downloadDecode");

function itemTool(ev) {
  const input = document.getElementById("itemDat");

  const fileInput = input.files[0];

  let reader = new FileReader();
  reader.addEventListener("load", async (f) => {
    file = f.target.result;
    btn.disabled = false;
  });
  reader.readAsArrayBuffer(fileInput);
}

async function decodeBtn(ev) {
  if (file) {
    btn.innerText = "Please wait...";
    const itemDat = new ItemsDat(file);
    const decoded = await itemDat.decode();
    fileJsonString = JSON.stringify(decoded, null, 2);

    decodeDownload.disabled = false;
    btn.innerText = "Done!";

    const data = URL.createObjectURL(new Blob([fileJsonString], { type: "text/json" }));

    decodeDownload.setAttribute("href", data);
    decodeDownload.setAttribute("download", "data.json");

    setTimeout(() => {
      btn.innerText = "Decode";
    }, 1500);
  } else {
    btn.innerText = "Please insert items.dat file";
    setTimeout(() => {
      btn.innerText = "Decode";
    }, 1500);
  }
}

function encodeBtn(ev) {
  // Soon
}

function test(ev) {
  const input = document.getElementById("itemDat");

  /** @type {FileList} */
  const fileE = input.files[0];

  let reader = new FileReader();
  reader.addEventListener("load", async (f) => {
    console.log("first itemsdat", f.target.result);
    const itemDat = new ItemsDat(f.target.result);
    const decoded = await itemDat.decode();
    console.log("#1 decoded test", decoded);
    const encoded = await itemDat.encode(decoded);
    console.log("#1 encoded test", encoded);

    const newItem = new ItemsDat(encoded);
    console.log("#2 decode test", await newItem.decode());
    const newDecode = await newItem.decode();
    const newEncode = await newItem.encode(newDecode);
    console.log("#2 encode test", newEncode);

    const item = new ItemsDat(newEncode);
    console.log("#3 decode", await item.decode());
    const itemDecode = await item.decode();
    const itemEncode = await item.encode(itemDecode);
    console.log("#3 encode test", itemEncode);
  });
  reader.readAsArrayBuffer(fileE);
}

class ItemsDat {
  /**
   * The key used for the XOR encryption/decryption.
   */
  key = "PBG892FXX982ABC*";

  /**
   * The current position of the reader/writer.
   */
  mempos = 0;

  stringFields = [
    "name",
    "texture",
    "extraFile",
    "petName",
    "petPrefix",
    "petSuffix",
    "petAbility",
    "extraOptions",
    "texture2",
    "extraOptions2",
    "punchOptions"
  ];

  /**
   * @type {DataView}
   */
  data;

  /**
   * @param {ArrayBuffer} chunk The data to encode/decode.
   */
  constructor(chunk) {
    this.data = new DataView(chunk);
  }

  /**
   * Get total byte size for writing.
   * @param items An array of items
   */
  getWriteSize(items) {
    let size = 194 * items.length;
    // get sizes for the string
    for (const item of items) {
      const keys = Object.keys(item);

      for (const key of keys) {
        if (this.stringFields.includes(key) && typeof item[key] === "string") {
          // calc length
          size += item[key].length + 2;
        }
      }
    }

    return size;
  }

  /**
   * Reads a string from the items.dat file whether it be XOR encrypted or not.
   * @param opts Options for reading the string.
   */
  readString(
    opts = {
      encoded: false
    }
  ) {
    return new Promise((resolve) => {
      const length = this.data.getInt16(this.mempos, true);
      this.mempos += 2;

      if (!opts.encoded) {
        const t = new TextDecoder().decode(
          this.data.buffer.slice(this.mempos, (this.mempos += length))
        );

        return resolve(t);
      } else {
        const chars = [];

        for (let i = 0; i < length; i++) {
          chars.push(
            String.fromCharCode(
              this.data.getUint8(this.mempos, true) ^
                this.key.charCodeAt((opts.id + i) % this.key.length)
            )
          );
          this.mempos++;
        }

        return resolve(chars.join(""));
      }
    });
  }

  /**
   * Writes a string to the items.dat data file, whether it be XOR encrypted or not.
   * @param {string} str The string to insert.
   * @param {number} id The id of the item.
   * @param encoded Wether or not to XOR encrypt the string.
   * @return {Promise<undefined>}
   */
  writeString(str, id, encoded = false) {
    return new Promise((resolve) => {
      this.data.setUint16(this.mempos, str.length, true);
      this.mempos += 2;

      if (!encoded) {
        // this.data.write(str, this.mempos, "utf8");
        let arr = new Uint8Array(this.data.buffer);
        arr.set(new TextEncoder().encode(str), this.mempos);

        // performace mungkin?
        this.data = new DataView(arr.buffer);

        this.mempos += str.length;
      } else {
        const chars = [];

        for (let i = 0; i < str.length; i++)
          chars.push(str.charCodeAt(i) ^ this.key.charCodeAt((i + id) % this.key.length));

        for (const char of chars) this.data.setUint8(this.mempos++, char);
      }

      return resolve(undefined);
    });
  }

  /**
   * Creates a new items.dat file.
   * @param meta The item data to use.
   * @return {Promise<ArrayBuffer>}
   */
  encode(meta) {
    return new Promise(async (resolve) => {
      if (this.mempos !== 0) this.mempos = 0; // this must be 0

      const size = this.getWriteSize(meta.items);
      console.log(size);
      this.data = new DataView(new ArrayBuffer(size)); // create new data

      this.data.setUint16(this.mempos, meta.version, true);
      this.mempos += 2;

      this.data.setUint32(this.mempos, meta.items.length, true);
      this.mempos += 4;

      for (const item of meta.items) {
        this.data.setInt32(this.mempos, item.id, true);
        this.mempos += 4;

        this.data.setUint8(this.mempos++, item.flags);
        this.data.setUint8(this.mempos++, item.flagsCategory);

        this.data.setUint8(this.mempos++, item.type);
        this.data.setUint8(this.mempos++, item.materialType);

        await this.writeString(item.name, item.id, true);
        await this.writeString(item.texture, item.id);

        this.data.setInt32(this.mempos, item.textureHash, true);
        this.mempos += 4;

        this.data.setUint8(this.mempos++, item.visualEffectType);

        // flags2
        this.data.setInt32(this.mempos, item.flags2, true);
        this.mempos += 4;

        this.data.setUint8(this.mempos++, item.textureX);
        this.data.setUint8(this.mempos++, item.textureY);
        this.data.setUint8(this.mempos++, item.storageType);
        this.data.setUint8(this.mempos++, item.isStripeyWallpaper);
        this.data.setUint8(this.mempos++, item.collisionType);
        this.data.setUint8(this.mempos++, item.breakHits * 6);

        this.data.setInt32(this.mempos, item.resetStateAfter, true);
        this.mempos += 4;

        this.data.setUint8(this.mempos++, item.bodyPartType);

        this.data.setInt16(this.mempos, item.rarity, true);
        this.mempos += 2;

        this.data.setUint8(this.mempos++, item.maxAmount);
        await this.writeString(item.extraFile, item.id);

        this.data.setInt32(this.mempos, item.extraFileHash, true);
        this.mempos += 4;

        this.data.setInt32(this.mempos, item.audioVolume, true);
        this.mempos += 4;

        await this.writeString(item.petName, item.id);
        await this.writeString(item.petPrefix, item.id);
        await this.writeString(item.petSuffix, item.id);
        await this.writeString(item.petAbility, item.id);

        this.data.setUint8(this.mempos++, item.seedBase);
        this.data.setUint8(this.mempos++, item.seedOverlay);
        this.data.setUint8(this.mempos++, item.treeBase);
        this.data.setUint8(this.mempos++, item.treeLeaves);

        this.data.setInt32(this.mempos, item.seedColor, true);
        this.mempos += 4;

        this.data.setInt32(this.mempos, item.seedOverlayColor, true);
        this.mempos += 4;

        this.data.setInt32(this.mempos, item.ingredient, true);
        this.mempos += 4;

        this.data.setInt32(this.mempos, item.growTime, true);
        this.mempos += 4;

        this.data.setInt16(this.mempos, item.flags3, true);
        this.mempos += 2;

        this.data.setInt16(this.mempos, item.isRayman, true);
        this.mempos += 2;

        await this.writeString(item.extraOptions, item.id);
        await this.writeString(item.texture2, item.id);
        await this.writeString(item.extraOptions, item.id);

        const extraBytesObj = item.extraBytes;

        if (typeof extraBytesObj === "object" && extraBytesObj?.type === "Buffer") {
          console.log(extraBytesObj);
          item.extraBytes = new TextEncoder().encode(extraBytesObj?.data);
        }

        // if (Buffer.isBuffer(item.extraBytes))
        if (item.extraBytes instanceof ArrayBuffer) {
          const t = new Uint8Array(item.extraBytes);
          // for (const byte of item.extraBytes) this.data.setUint8(this.mempos++, byte);
          for (let i = 0; i < item.extraBytes.byteLength; i++) {
            this.data.setUint8(this.mempos++, t[i]);
          }
        }

        if (meta.version >= 11) {
          await this.writeString(item.punchOptions || "", item.id);

          if (meta.version >= 12) {
            this.data.setInt32(this.mempos, item.flags4, true);
            this.mempos += 4;

            const bodyPartObj = item.bodyPart;

            if (typeof bodyPartObj === "object" && bodyPartObj?.type === "Buffer")
              item.bodyPart = new TextEncoder().encode(bodyPartObj?.data);

            if (item.bodyPart instanceof ArrayBuffer) {
              const t = new Uint8Array(item.bodyPart);
              for (let i = 0; i < item.bodyPart.byteLength; i++) {
                this.data.setUint8(this.mempos++, t[i]);
              }
            }
          }

          if (meta.version >= 13) {
            this.data.setInt32(this.mempos, item.flags5, true);
            this.mempos += 4;
          }

          if (meta.version >= 14) this.mempos += 4;

          if (meta.version >= 15) {
            this.mempos += 25;
            await this.writeString(item.extraTexture || "", item.id);
          }
        }
      }

      this.mempos = 0; // reset again
      return resolve(this.data.buffer);
    });
  }

  /**
   * Decodes the items.dat
   * @returns {Promise<any>}
   */
  decode() {
    return new Promise(async (resolve) => {
      const meta = {
        items: []
      };

      meta.version = this.data.getUint16(this.mempos, true);
      this.mempos += 2;

      meta.itemCount = this.data.getUint32(this.mempos, true);
      this.mempos += 4;

      for (let i = 0; i < meta.itemCount; i++) {
        const item = {};

        item.id = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.flags = this.data.getUint8(this.mempos++);
        item.flagsCategory = this.data.getUint8(this.mempos++);

        item.type = this.data.getUint8(this.mempos++);
        item.materialType = this.data.getUint8(this.mempos++);

        item.name = await this.readString({ id: item.id, encoded: true });
        item.texture = await this.readString({ id: item.id });

        item.textureHash = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.visualEffectType = this.data.getUint8(this.mempos++);

        // flags2
        item.flags2 = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.textureX = this.data.getUint8(this.mempos++);
        item.textureY = this.data.getUint8(this.mempos++);
        item.storageType = this.data.getUint8(this.mempos++);
        item.isStripeyWallpaper = this.data.getUint8(this.mempos++);
        item.collisionType = this.data.getUint8(this.mempos++);
        item.breakHits = this.data.getUint8(this.mempos++) / 6;

        item.resetStateAfter = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.bodyPartType = this.data.getUint8(this.mempos++);

        item.rarity = this.data.getInt16(this.mempos, true);
        this.mempos += 2;

        item.maxAmount = this.data.getUint8(this.mempos++);
        item.extraFile = await this.readString({ id: item.id });

        item.extraFileHash = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.audioVolume = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.petName = await this.readString({ id: item.id });
        item.petPrefix = await this.readString({ id: item.id });
        item.petSuffix = await this.readString({ id: item.id });
        item.petAbility = await this.readString({ id: item.id });

        item.seedBase = this.data.getUint8(this.mempos++);
        item.seedOverlay = this.data.getUint8(this.mempos++);
        item.treeBase = this.data.getUint8(this.mempos++);
        item.treeLeaves = this.data.getUint8(this.mempos++);

        item.seedColor = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.seedOverlayColor = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.ingredient = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.growTime = this.data.getInt32(this.mempos, true);
        this.mempos += 4;

        item.flags3 = this.data.getInt16(this.mempos, true);
        this.mempos += 2;

        item.isRayman = this.data.getInt16(this.mempos, true);
        this.mempos += 2;

        item.extraOptions = await this.readString({ id: item.id });
        item.texture2 = await this.readString({ id: item.id });
        item.extraOptions = await this.readString({ id: item.id });

        item.extraBytes = Array.from(
          new Uint8Array(this.data.buffer.slice(this.mempos, (this.mempos += 80)))
        );

        if (meta.version >= 11) {
          item.punchOptions = await this.readString({ id: item.id });

          if (meta.version >= 12) {
            item.flags4 = this.data.getInt32(this.mempos, true);
            this.mempos += 4;

            item.bodyPart = Array.from(
              new Uint8Array(this.data.buffer.slice(this.mempos, (this.mempos += 9)))
            );
          }

          if (meta.version >= 13) {
            item.flags5 = this.data.getInt32(this.mempos, true);
            this.mempos += 4;
          }

          if (meta.version >= 14) this.mempos += 4;

          if (meta.version >= 15) {
            this.mempos += 25;
            item.extraTexture = await this.readString({ id: item.id });
          }
        }

        meta.items.push(item);
      }

      this.mempos = 0;
      return resolve(meta);
    });
  }
}

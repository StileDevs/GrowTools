import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import type { ItemsDatMeta } from "@/types";
import { ItemsDat } from "@/utils/ItemsDat";

export const useItemsDatStore = defineStore("itemsdat", () => {
  const chunkFile = ref<number[]>([]);
  const data = reactive<ItemsDatMeta>({
    items: [],
    itemCount: 0,
    version: 0,
  });

  async function parse() {
    const itemsdat = new ItemsDat(chunkFile.value);
    await itemsdat.decode();

    data.items = itemsdat.meta.items;
    data.itemCount = itemsdat.meta.itemCount;
    data.version = itemsdat.meta.version;
  }

  async function setFile(file: File): Promise<boolean> {
    try {
      const reader = new FileReader();
      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(new Error("File reading aborted"));
        reader.readAsArrayBuffer(file);
      });

      chunkFile.value = Array.from(new Uint8Array(result));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  return { chunkFile, data, setFile, parse };
});

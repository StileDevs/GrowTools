<script setup lang="ts">
import type { ItemDefinition } from "@/types";
import { onMounted, ref } from "vue";

const props = defineProps<{
  item: ItemDefinition;
  width: string;
  height: string;
}>();

const cv = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (cv.value) {
    const ctx = cv.value.getContext("2d")!;
    const image = new Image();

    image.src = `/game-image/game/${props.item.texture?.replace(".rttex", ".png")}`;

    image.addEventListener("load", () => {
      const textureX = (props.item.textureX as number) * 32;
      const textureY = (props.item.textureY as number) * 32;

      ctx?.drawImage(image, textureX, textureY, 32, 32, 0, 0, 64, 64);
    });
  }
});
</script>
<template>
  <canvas ref="cv" :width="props.width" :height="props.height"></canvas>
</template>

<script setup lang="ts">
import type { ItemDefinition } from "@/types";
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  item: ItemDefinition;
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
  <Transition name="item-gt" mode="out-in">
    <RouterLink
      class="transition-all duration-300 ease-in-out hover:border-gray-500 hover:border-opacity-100 border border-transparent rounded-xl max-w-64 w-full h-48 p-6"
      :to="`/items-dat/${item.id}`"
    >
      <main>
        <canvas ref="cv" width="64" height="64" class="m-auto"></canvas>
      </main>

      <div class="mt-4">
        <h1 class="font-bold md:text-lg text-sm text-center">{{ props.item.name }}</h1>
      </div>
    </RouterLink>
  </Transition>
</template>

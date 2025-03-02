<script setup lang="ts">
import MainContainer from "@/components/MainContainer.vue";
import { ayaPictures } from "@/consts";
import { computed } from "vue";

const randomAyaPicture = computed(() => {
  const randomIndex = Math.floor(Math.random() * ayaPictures.length);
  return ayaPictures[randomIndex];
});
</script>

<template>
  <MainContainer>
    <div>Nothing to see here.</div>
    <div class="mb-4">here some Aya's cute picture</div>
    <img :src="randomAyaPicture.img" alt="cute aya" class="aspect-square object-cover w-[400px]" />
    <div class="mt-4">Artist: {{ randomAyaPicture.artist }}</div>
    <a
      :href="randomAyaPicture.originalUrl"
      target="_blank"
      class="text-blue-500 hover:text-blue-200"
      >{{ randomAyaPicture.originalUrl }}</a
    >
  </MainContainer>
</template>

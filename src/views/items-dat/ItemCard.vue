<script setup lang="ts">
import RenderItemImage from "@/components/RenderItemImage.vue";
import type { ItemDefinition } from "@/types";
import { RouterLink } from "vue-router";

const props = defineProps<{
  item: ItemDefinition;
}>();
</script>
<template>
  <Transition name="item-gt" mode="out-in">
    <RouterLink
      class="transition-all duration-300 ease-in-out hover:border-gray-500 hover:border-opacity-100 border border-transparent rounded-xl max-w-64 w-full h-48 p-6"
      :to="`/items-dat/${item.id}`"
    >
      <main>
        <RenderItemImage :item="item" width="64" height="64" class="m-auto" />
      </main>

      <div class="mt-4">
        <h1 class="font-bold md:text-lg text-sm text-center">{{ props.item.name }}</h1>
      </div>
    </RouterLink>
  </Transition>
</template>

<script setup lang="ts">
import MainContainer from "@/components/MainContainer.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import { useItemsDatStore } from "@/stores/itemsdat";
import { computed } from "vue";
import { useRoute } from "vue-router";

const $route = useRoute();

const itemsdat = useItemsDatStore();
const item = computed(() =>
  itemsdat.data.items.find((i) => i.id === parseInt($route.params.id as string)),
);
</script>

<template>
  <NotFoundView v-if="!item" />
  <Transition name="item-gt" mode="out-in" v-else>
    <MainContainer>{{ item.name }}</MainContainer>
  </Transition>
</template>

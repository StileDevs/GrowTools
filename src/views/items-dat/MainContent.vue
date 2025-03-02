<script setup lang="ts">
import Paginator, { type PageState } from "primevue/paginator";
import ItemCard from "./ItemCard.vue";
import { useItemsDatStore } from "@/stores/itemsdat";
import { computed, ref, watchEffect } from "vue";

const itemsdat = useItemsDatStore();
const items = computed(() => itemsdat.data?.items || []);
const isLoading = ref(true);

const currentPage = ref(0);
const rows = ref(16);

const totalRecords = computed(() => items.value.length);
const paginatedItems = computed(() => {
  const start = currentPage.value * rows.value;
  const end = start + rows.value;
  return items.value.slice(start, end);
});

watchEffect(() => {
  if (items.value.length > 0) {
    isLoading.value = false;
  }
});

const onPageChange = (event: PageState) => {
  currentPage.value = event.page;
};
</script>
<template>
  <div v-if="isLoading" class="p-6">Nothing</div>
  <template v-else>
    <div class="p-6 flex flex-wrap items-center justify-center gap-8">
      <ItemCard v-for="item in paginatedItems" :key="`${item.id}-${items.length}`" :item="item">
      </ItemCard>
    </div>

    <Paginator
      :template="{
        '640px': 'PrevPageLink CurrentPageReport NextPageLink',
        '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
        '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
        default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageInput',
      }"
      :rows="rows"
      :totalRecords="totalRecords"
      :first="currentPage * rows"
      @page="onPageChange"
    >
    </Paginator>
  </template>
</template>

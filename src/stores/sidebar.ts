import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { useMediaQuery } from "@vueuse/core";

export const useSidebarStore = defineStore("sidebar", () => {
  const visible = ref(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  watch(
    isMobile,
    (mobile) => {
      if (mobile) {
        visible.value = false;
      }
    },
    { immediate: true },
  );

  const toggleVisible = () => (visible.value = !visible.value);

  return { visible, toggleVisible };
});

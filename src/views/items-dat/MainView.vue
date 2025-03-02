<script setup lang="ts">
import MainContainer from "@/components/MainContainer.vue";
import UploadFile from "./UploadFile.vue";
import MainContent from "./MainContent.vue";
</script>

<template>
  <MainContainer class="flex flex-col gap-20">
    <div>
      <UploadFile />
    </div>
    <div>
      <MainContent />
    </div>
  </MainContainer>
</template>

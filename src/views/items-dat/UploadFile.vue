<script setup lang="ts">
import FileUpload, { type FileUploadSelectEvent } from "primevue/fileupload";
import Card from "primevue/card";
import Button from "primevue/button";
import { useItemsDatStore } from "@/stores/itemsdat";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
const toast = useToast();
const itemsDat = useItemsDatStore();

const uploaded = ref(false);
const fileUploadLoading = ref(false);
const buildLoading = ref(false);

async function onSelectFile(data: FileUploadSelectEvent) {
  fileUploadLoading.value = true;
  await itemsDat.setFile(data.files[0]);
  fileUploadLoading.value = false;

  uploaded.value = true;
  toast.add({ severity: "info", summary: "Success", detail: "File Uploaded", life: 3000 });
}

async function onParseFile() {
  buildLoading.value = true;
  await itemsDat.parse();
  buildLoading.value = false;
  uploaded.value = false;
}
</script>

<template>
  <div>
    <Card>
      <template #title>
        <h1 class="font-bold text-2xl">ItemsDat</h1>
      </template>
      <template #content>
        <div class="flex gap-2">
          <Button
            :label="buildLoading ? 'Please wait' : 'Build'"
            icon="pi pi-wrench"
            @click="onParseFile()"
            :disabled="!uploaded"
            :loading="buildLoading"
            :text="uploaded"
          ></Button>

          <FileUpload
            mode="basic"
            :custom-upload="true"
            @select="onSelectFile($event)"
            :multiple="false"
            accept="*.dat"
            :maxFileSize="10000000"
            :choose-button-props="{ loading: fileUploadLoading, disabled: fileUploadLoading }"
          >
          </FileUpload>
        </div>
      </template>
    </Card>
  </div>
</template>

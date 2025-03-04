<script setup lang="ts">
import MainContainer from "@/components/MainContainer.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import RenderItemImage from "@/components/RenderItemImage.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import { useItemsDatStore } from "@/stores/itemsdat";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const $route = useRoute();

const itemsdat = useItemsDatStore();
const item = computed(() =>
  itemsdat.data.items.find((i) => i.id === parseInt($route.params.id as string)),
);

const editMode = ref(false);
const editedItem = ref({ ...item.value });

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (editMode.value) {
    editedItem.value = { ...item.value };
  }
};

const saveChanges = () => {
  // TODO: Implement save logic
  console.log(editedItem.value);
  // itemsdat.updateItem(editedItem.value);
  editMode.value = false;
};
</script>
<template>
  <NotFoundView v-if="!item" />
  <Transition name="item-gt" mode="out-in" v-else>
    <MainContainer>
      <div class="flex justify-between items-center mb-4 gap-4">
        <div class="flex flex-wrap gap-4 items-center">
          <RenderItemImage :item="item" width="64" height="64" />
          <div>
            <h1 class="font-bold text-xl">
              <template v-if="!editMode">{{ item.name }}</template>
              <InputText type="text" fluid v-else v-model="editedItem.name" />
            </h1>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 items-center">
          <Button
            v-if="editMode"
            @click="saveChanges"
            severity="success"
            label="Save Changes"
            class="w-full"
          >
          </Button>
          <Button
            class="w-full"
            @click="toggleEditMode"
            :label="editMode ? 'Cancel' : 'Edit'"
            :severity="editMode ? 'danger' : 'info'"
          >
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Basic Information</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                id: item.id,
                type: item.type,
                materialType: item.materialType,
                rarity: item.rarity,
                maxAmount: item.maxAmount,
                breakHits: item.breakHits,
                growTime: item.growTime,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="break-all">{{ value }}</div>
              <InputNumber v-else fluid v-model="editedItem[key]" type="number" />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Flags</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                flags: item.flags,
                flagsCategory: item.flagsCategory,
                flags2: item.flags2,
                flags3: item.flags3,
                flags4: item.flags4,
                flags5: item.flags5,
                extraFlags1: item.extraFlags1,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="break-all">{{ value }}</div>
              <InputNumber v-else fluid v-model="editedItem[key]" type="number" />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Texture Properties</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                texture: item.texture,
                textureHash: item.textureHash,
                texture2: item.texture2,
                textureX: item.textureX,
                textureY: item.textureY,
                extraTexture: item.extraTexture,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="brek-all">{{ value }}</div>
              <InputText
                v-else
                fluid
                v-model="editedItem[key] as number | string"
                :type="typeof value === 'number' ? 'number' : 'text'"
              />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Pet Properties</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                petName: item.petName,
                petPrefix: item.petPrefix,
                petSuffix: item.petSuffix,
                petAbility: item.petAbility,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="break-all">{{ value }}</div>
              <InputNumber v-else fluid v-model="editedItem[key]" />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Tree/Seed Properties</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                seedBase: item.seedBase,
                seedOverlay: item.seedOverlay,
                treeBase: item.treeBase,
                treeLeaves: item.treeLeaves,
                seedColor: item.seedColor,
                seedOverlayColor: item.seedOverlayColor,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode">{{ value }}</div>
              <InputText v-else fluid v-model="editedItem[key]" type="text" />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 sm:col-span-1 col-span-2">
          <h3 class="font-bold mb-2">Additional Properties</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                extraFile: item.extraFile,
                extraFileHash: item.extraFileHash,
                extraOptions: item.extraOptions,
                extraOptions2: item.extraOptions2,
                punchOptions: item.punchOptions,
                itemRenderer: item.itemRenderer,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="break-all">{{ value }}</div>
              <InputText v-else fluid v-model="editedItem[key]" :type="'text'" />
            </div>
          </div>
        </section>

        <section class="border rounded p-4 col-span-2">
          <h3 class="font-bold mb-2">Array Bytes Properties</h3>
          <div>
            <div
              class="flex flex-wrap sm:flex-row flex-col gap-y-3 justify-between"
              v-for="(value, key) in {
                extraByte: item.extraBytes,
                bodyPart: item.bodyPart,
                unknownBytes1: item.unknownBytes1,
                unknownBytes2: item.unknownBytes2,
              }"
              :key="key"
            >
              <div class="font-semibold mt-1">{{ key }}:</div>
              <div v-if="!editMode" class="break-all">{{ value }}</div>
              <InputText v-else fluid v-model="editedItem[key]" :type="'text'" />
            </div>
          </div>
        </section>
      </div>
    </MainContainer>
  </Transition>
</template>

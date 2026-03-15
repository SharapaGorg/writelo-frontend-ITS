<template>
  <div>
    <input
        type="file"
        ref="fileInput"
        class="hidden"
        :accept="fileTypes.join(',')"
        @change="handleFileChange"
    />
    <Button
        size="icon"
        variant="outline"
        @click="triggerFileInput"
    >
      <Paperclip class="icon"/>
    </Button>
  </div>
</template>

<script setup lang="ts">
import {Paperclip} from "lucide-vue-next";
import {ref} from 'vue';
import {ApiController} from "~/scripts/shared/api/controller";

const apiController = new ApiController();
const fileInput = ref<HTMLInputElement | null>(null);

const fileTypes = ref([]);

onMounted(async () => {
  const response = await apiController.getFileTypes();
  if (!response?.extensions) return;

  for (let key in response.extensions) {
    fileTypes.value = [...fileTypes.value, ...response.extensions[key]];
  }
})

const triggerFileInput = () => {
  fileInput.value?.click();
};


const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];

    useAttachMedia().attachFile(file);
  }
};
</script>

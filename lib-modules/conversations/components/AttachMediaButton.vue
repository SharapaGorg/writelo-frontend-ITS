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
import {computed, ref} from 'vue';
import {useSettings} from "~/composables/settings";

const {config} = useSettings();
const fileInput = ref<HTMLInputElement | null>(null);

const fileTypes = computed(() => {
  const extensions = config.value?.filesConfig?.extensions;
  if (!extensions) return [];
  return Object.values(extensions).flat();
});

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

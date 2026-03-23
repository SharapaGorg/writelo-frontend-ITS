<template>
  <div class="flex w-full gap-x-2">
    <div class="icon" v-show="!loaded">
      <Spinner/>
    </div>

    <File class="icon" v-show="fileSuccessfullyLoaded && !isImage"/>
    <TriangleAlert class="icon" v-show="fileUploadingFailed"/>

    <div class="file-name" v-show="!isImage">{{ file.name }}</div>

    <div class="flex-1">
      <NuxtImg
          v-if="isImage && imgSrc"
          class="max-w-[200px] h-[100px] rounded-lg overflow-hidden object-cover object-center"
          alt="attached image preview"
          :src="imgSrc"
      />
    </div>

    <Button
        size="icon"
        class="w-7 h-7 flex-shrink-0"
        variant="outline"
        @click="detachFile"
    >
      <X class="w-4 h-4"/>
    </Button>

  </div>
</template>

<script setup lang="ts">
import {File, TriangleAlert, X} from "lucide-vue-next";
import Spinner from "~/components/atoms/Spinner.vue";
import {computed, ref, watch, onBeforeUnmount} from "vue";
import {FileForm} from "~/lib-modules/conversations";
import type {AttachedFile} from "~/stores/attachingMedia";
import {Button} from "~/components/ui/button";

const props = defineProps<AttachedFile>();

let objectUrl: string | null = null;
const imgSrc = ref<string | null>(null);

const isImage = computed(() => {
  return props.fileType === FileForm.image;
});

const fileSuccessfullyLoaded = computed(() => {
  return props.loaded && !fileUploadingFailed.value;
})

const fileUploadingFailed = computed(() => {
  return typeof props.error === "string";
});

function updateImgSrcFromContent(file: File) {
  if (file) {
    objectUrl = URL.createObjectURL(file);
    imgSrc.value = objectUrl;
  }
}

function detachFile() {
  useAttachMedia().detachFile(props.hash);
}

// Watch for changes to the file
watch(() => props.file, (newFile: File) => {
  // todo: подумать над проблемой того, что пнгшки с черным foreграундом в темной теме почти невидимы

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    imgSrc.value = null;
  }

  // Create new object URL if image and loaded
  if (newFile && isImage.value && props.loaded) {
    updateImgSrcFromContent(props.file);
  }
}, {immediate: true});

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
});
</script>

<style scoped>
.icon {
  @apply w-6 h-6;
}

.file-name {
  @apply flex-1 min-w-0 truncate text-sm;
}
</style>
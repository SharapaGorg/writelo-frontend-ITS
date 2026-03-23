<template>
  <div class="attached-file-container" :style="{ bottom: height + 'px' }">
    <div class="flex flex-col gap-y-2 w-full">
      <AttachedMedia
          v-for="item in attachedFiles"
          :key="item.hash"
          v-bind="item"
      />
    </div>


  </div>
</template>

<script setup lang="ts">
import AttachedMedia from "./AttachedMedia.vue";

withDefaults(defineProps<{
  height?: number
}>(), {
  height: 150
})

const {attachedFiles} = useAttachMedia();

</script>

<style scoped>
.attached-file-container {
  @apply flex items-center gap-x-2 px-5 pt-3 pb-[30px] rounded-t-3xl
  border-x-[1px] border-t-[1px] translate-y-5 -mt-[18px]
  backdrop-blur-lg bg-white/30 dark:bg-black/30
  fixed bottom-[150px] w-screen  border-border
}

</style>
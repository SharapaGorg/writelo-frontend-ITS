<template>
  <div
    :class="props.inline ? 'attached-file-container-inline' : 'attached-file-container'"
    :style="props.inline ? undefined : { bottom: height + 'px' }"
  >
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

const props = withDefaults(defineProps<{
  height?: number
  // Inline mode: render in-flow above the input instead of fixed-positioned
  // against the viewport bottom (the latter is hardcoded for the chat layout
  // where SendMessageSection itself is fixed; in EditorChatPanel and other
  // contained chat panels it floats over unrelated UI).
  inline?: boolean
}>(), {
  height: 150,
  inline: false
})

const {attachedFiles} = useAttachMedia();

</script>

<style scoped>
.attached-file-container {
  @apply flex items-center gap-x-2 px-5 pt-3 pb-[30px] rounded-t-3xl
  border-x-[1px] border-t-[1px] translate-y-5 -mt-[18px]
  backdrop-blur-lg bg-background/30
  fixed bottom-[150px] w-screen  border-border
}

.attached-file-container-inline {
  @apply flex items-center gap-x-2 px-3 py-2 w-full
  bg-background/60 border-t border-border
}

</style>
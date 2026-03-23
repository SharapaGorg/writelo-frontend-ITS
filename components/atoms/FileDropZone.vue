<template>
  <teleport to="body">
    <transition name="fade">
      <div
          v-if="visible"
          class="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center"
          @dragover.prevent
      >
        <div
            class="rounded-xl border-4 border-dashed border-white bg-white/70 dark:bg-black/70 px-8 py-6 text-center shadow-2xl flex flex-col items-center gap-y-4"
        >
          <FileDown class="w-[100px] h-[100px]"/>

          <p class="text-xl font-semibold text-black dark:text-white">{{ t('drop-files') }}</p>
          <p v-if="multiple" class="mt-2 text-sm text-black/60 dark:text-white/60">Можно несколько файлов</p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {useI18n} from "vue-i18n";
import {FileDown} from "lucide-vue-next";

const emit = defineEmits<{
  (e: 'files', files: FileList): void
}>()

const props = withDefaults(defineProps<{
  multiple?: boolean
}>(), {
  multiple: false
})


const {t} = useI18n();

const visible = ref(false)
let dragCounter = 0

function onDragEnter(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    dragCounter++
    visible.value = true
  }
}

function onDragLeave(e: DragEvent) {
  dragCounter--
  if (dragCounter <= 0) {
    visible.value = false
    dragCounter = 0
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  visible.value = false
  dragCounter = 0
  if (e.dataTransfer?.files?.length) {
    emit('files', e.dataTransfer.files);

    const {attachFile} = useAttachMedia();
    attachFile(e.dataTransfer.files[0]);
  }
}

function onPaste(e: ClipboardEvent) {
  if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
    const files = e.clipboardData.files;

    const {attachFile} = useAttachMedia();
    attachFile(files[0]);
    e.preventDefault();
  }
}


onMounted(() => {
  document.addEventListener('paste', onPaste);
  document.addEventListener('dragenter', onDragEnter)
  document.addEventListener('dragleave', onDragLeave)
  document.addEventListener('drop', onDrop)
})
onBeforeUnmount(() => {
  document.removeEventListener('dragenter', onDragEnter)
  document.removeEventListener('dragleave', onDragLeave)
  document.removeEventListener('drop', onDrop);
  document.removeEventListener('paste', onPaste);
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

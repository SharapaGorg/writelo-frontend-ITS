<script setup lang="ts">

import {Copy, RefreshCw, Edit3} from 'lucide-vue-next';
import {toastCopyClipboard} from "~/scripts/features/utils/toater";
import {ApiController} from "~/scripts/shared/api/controller";
import {eventBus} from '~/composables/eventBus'
import {useI18n} from 'vue-i18n'
import {Role} from "~/lib-modules/conversations";

const {t} = useI18n();

const emit = defineEmits(['edit']);

const props = defineProps<{
  messageText: string,
  role: Role,
  showReroll : boolean
}>();

const copyToClipBoard = () => {
  navigator.clipboard.writeText(props.messageText).then(() => {
    toastCopyClipboard(t);
  })
}

const rerollMessage = async () => {
  eventBus.emit('rerollMessage')
}

</script>

<template>
  <div class="message-bottom-bar-container" :class="role === Role.user ? 'ml-auto' : ''">
    <div class="icon-button" @click="copyToClipBoard">
      <Copy class="icon"/>
    </div>

    <div class="icon-button" @click="emit('edit')" v-if="role === Role.user">
      <Edit3 class="icon"/>
    </div>

    <div
        class="icon-button"
        @click="rerollMessage"
        v-if="role === Role.assistant && showReroll"
    >
      <RefreshCw class="icon"/>
    </div>
  </div>
</template>

<style scoped>

.message-bottom-bar-container {
  @apply flex items-center mt-2 h-[36px]
}

.message-bottom-bar-container .icon {
  @apply w-5 h-5
}

</style>
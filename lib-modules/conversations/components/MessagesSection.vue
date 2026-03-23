<template>
  <div
      class="messages-container"
      :class="messages.length ? 'h-fit' : 'h-full'"
      ref="messagesContainer"
      @scroll="onUserScroll"
  >
    <FullScreenFilePreview/>


    <div class="pb-[160px]" v-if="messages.length">
      <div
          v-for="message in messages"
          :key="message.id"
      >
        <template v-if="message.file?.name">
          <FileMessage
              :file-type="message.file.type"
              :file-name="message.file.name"
              :file-id="message.file.fileId"
              :access-hash="message.file.accessHash"
              :content="message.file?.content"
              class="mb-2"
              @click="openFile(message.file)"
          />
        </template>

        <div v-if="message.files?.length" class="mb-2 flex flex-col gap-y-2">
          <FileMessage
              v-for="file in message.files"
              :key="file.fileId"
              :file-id="file.fileId"
              :access-hash="file.accessHash"
              :file-name="file.name"
              :file-type="file.type"
              :content="file.content"
              @click="openFile(file)"
          />
        </div>

        <Message
            :text="message.text"
            :role="message.role"
            :created_at="message.created_at"
            :id="message.id"
            :processing="message.processing"
            :error="message.error"
            :is-last="messages.indexOf(message) === messages.length - 1"
        />
      </div>
    </div>

    <div v-if="!messages.length" class="greetings-container">
      <Sparkle class="w-[100px] h-[100px] flex-shrink-0"/>

      <div class="text-xl mt-10">{{ $t('welcome') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, nextTick, type Ref} from 'vue';
import type {FileType, MessageType} from '~/lib-modules/conversations';
import {Sparkle} from 'lucide-vue-next';
import FullScreenFilePreview from "~/components/atoms/FullScreenFilePreview.vue";
import {FileMessage, Message} from "~/lib-modules/conversations";

const props = defineProps<{ messages: MessageType[] }>();

const messagesContainer: Ref<HTMLElement | null> = ref(null);


const openFile = async (file: FileType) => {
  // downloadFile(response, file.name, file.type)
}

let userScrolledUp = false;
let alreadyScrolled = false;

const scrollContainer = () => {
  if (messagesContainer.value && !userScrolledUp) {
    // messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: alreadyScrolled ? "smooth" : "instant"
    })

    alreadyScrolled = true;
  }
};

const onUserScroll = () => {
  // Note: This function may not be called anymore since scrolling moved to main-wrapper
  // But keeping for compatibility
  if (messagesContainer.value) {
    const {scrollTop, scrollHeight, clientHeight} = messagesContainer.value;
    userScrolledUp = scrollTop + clientHeight < scrollHeight - 1;

    // Unfocus text field when user scrolls messages
    const focusedElement = document.activeElement as HTMLElement;
    if (focusedElement && (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT')) {
      focusedElement.blur();
    }
  }
};

const updateScroll = async () => {
  await nextTick();
  scrollContainer();
};

watch(
    () => props.messages,
    (newMessages) => {
      updateScroll();
    },
    {deep: true}
);

</script>

<style scoped>

.greetings-container {
  @apply w-full flex flex-col items-center h-full justify-center
  pb-[150px]
}

.messages-container {
  @apply px-4 pt-4  flex flex-col gap-y-6 flex-1 overflow-visible
  overflow-x-hidden
  scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
  min-h-0
}

</style>

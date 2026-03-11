<template>
  <div :class="isAssistant ? 'assistant-message-container' : 'user-message-container'">
    <div
        class="rounded-lg px-3 py-2"
        :class="isAssistant ? '' : 'bg-stone-200 dark:bg-stone-800 dark:text-white'"
        v-if="!editing && (messageText || role === Role.assistant)"
    >
      <div
          class="rendered-text-content"
          v-html="renderedText"
          ref="renderArea"
          :class="props.error ? ' text-red-500 font-bold' : ''"
      ></div>

      <div v-show="processing && !text.length" class="min-h-[2rem]">
        <InteractiveLoader/>
      </div>
    </div>

    <div
        contenteditable="true"
        class="edit-message-field"
        v-if="editing"
        v-html="renderedText"
        ref="editArea"
        @input="updateEditedContent"
    >
    </div>

    <div class="flex items-center gap-x-2 ml-auto" v-if="editing">
      <Button size="sm" variant="outline" @click="editing = false">Close</Button>
      <Button size="sm" variant="secondary" @click="saveEditedMessage">Save</Button>
    </div>

    <MessageBottomBar
        @edit="editing = true"
        v-if="messageText && messageText.length && !editing && !props.error"
        :role="props.role"
        :message-text="messageText"
        :show-reroll="!processing && !error && isLast"
    />
  </div>
</template>

<script setup lang="ts">

import {Role} from "~/lib-modules/conversations";
import InteractiveLoader from "~/components/atoms/InteractiveLoader.vue";
import {toastCopyCodeClipboard} from "~/scripts/features/utils/toater";
import {eventBus} from '~/composables/eventBus'
import {MessageBottomBar} from "~/lib-modules/conversations";

import {useI18n} from 'vue-i18n'

const {t} = useI18n();

const renderArea: Ref<HTMLElement> = ref(null);
const editArea: Ref<HTMLElement> = ref(null);
const editing = ref(false);

const props = defineProps({
  id: Number | String,
  text: String,
  created_at: String,
  role: Role,
  processing: Boolean,
  error: Boolean,
  isLast: Boolean
})

const messageText = ref(props.text);
watch(() => props.text, value => {
  messageText.value = value;
  updateRenderedText();
})

const updateEditedContent = () => {
  if (editArea.value) {
    messageText.value = editArea.value.innerText;
  }
}

const saveEditedMessage = async () => {
  editing.value = false;
  // Get the raw HTML from the contenteditable div
  const newHtml = messageText.value || editArea.value?.innerText || "";

  updateRenderedText();

  eventBus.emit('editMessage', {
    messageId: props.id,
    newText: newHtml
  })
}

const isUser = props.role === Role.user;
const isAssistant = props.role === Role.assistant;

const {$mdRenderer} = useNuxtApp();

const renderedText = ref("");

const updateRenderedText = () => {
  if (props.role === Role.user) {
    $mdRenderer.disable(['fence', 'code']);
  } else {
    $mdRenderer.enable(['fence', 'code']);
  }

  renderedText.value = $mdRenderer.render(messageText.value || "");
}

onBeforeMount(() => {
  updateRenderedText();
});


onMounted(() => {
  let buttons = document.querySelectorAll('button.code-copy');
  for (let button of buttons) {
    button.onclick = function () {
      const textToCopy = button.parentElement.parentElement.querySelector('pre').innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        toastCopyCodeClipboard(t);
      })
    };
  }

})

</script>

<style>

.assistant-message-container {
  @apply flex flex-col gap-2 rounded-lg text-sm
  flex-grow
}

.rendered-text-content {
  @apply flex flex-col gap-y-4
}

.rendered-text-content a {
  @apply text-blue-400
}

.rendered-text-content span.katex {
  @apply overflow-x-auto overflow-y-hidden
  scrollbar-thin
}

.rendered-text-content a:hover {
  @apply underline
}

/* Headers styling */
.rendered-text-content h1 {
  @apply text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6
  border-b-2 border-blue-200 dark:border-blue-800 pb-2
}

.rendered-text-content h2 {
  @apply text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5
  border-b border-gray-200 dark:border-gray-700 pb-1
}

.rendered-text-content h3 {
  @apply text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4
}

.rendered-text-content h4 {
  @apply text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-3
}

.rendered-text-content h5 {
  @apply text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 mt-2
}

.rendered-text-content h6 {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 mt-2
}

/* Lists styling */
.rendered-text-content ol {
  @apply list-decimal list-inside flex flex-col gap-y-2 my-3 ml-4
}

.rendered-text-content ol li {
  @apply text-gray-800 dark:text-gray-200 pl-2
}

.rendered-text-content ul {
  @apply flex flex-col gap-y-2 my-3 ml-4
}

.rendered-text-content ul li {
  @apply relative pl-6 text-gray-800 dark:text-gray-200
  before:content-[''] before:absolute before:left-0 before:top-2
  before:w-2 before:h-2 before:bg-blue-500 before:rounded-full
}

/* Nested lists */
.rendered-text-content ul ul,
.rendered-text-content ol ol,
.rendered-text-content ul ol,
.rendered-text-content ol ul {
  @apply ml-4 mt-2
}

.rendered-text-content ul ul li:before {
  @apply bg-green-500
}

.rendered-text-content ul ul ul li:before {
  @apply bg-purple-500
}

.rendered-text-content p {
  @apply inline
}

/* Table styles for markdown */
.rendered-text-content table {
  @apply w-full border-collapse my-4 overflow-x-auto block
}

.rendered-text-content table thead {
  @apply bg-gray-100 dark:bg-gray-800
}

.rendered-text-content table th {
  @apply px-4 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600
}

.rendered-text-content table td {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600
}

.rendered-text-content table tbody tr {
  @apply hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
}

.rendered-text-content table tbody tr:nth-child(even) {
  @apply bg-gray-50 dark:bg-gray-900
}

/* Make table responsive */
.rendered-text-content table {
  @apply min-w-full
}

.rendered-text-content table::-webkit-scrollbar {
  @apply h-2
}

.rendered-text-content table::-webkit-scrollbar-track {
  @apply bg-transparent
}

.rendered-text-content table::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded
}

/* Wrapper for horizontal scroll on small screens */
.rendered-text-content > table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .rendered-text-content table {
    font-size: 0.875rem;
  }
  
  .rendered-text-content table th,
  .rendered-text-content table td {
    @apply px-2 py-1
  }
}

code.hljs {
  @apply scrollbar-thin scrollbar-track-transparent scrollbar-thumb-text-color;
  @apply rounded-b-xl overflow-x-auto bg-light-code dark:bg-code;
}

.code-toolbar {
  @apply p-2 flex items-center justify-between mt-1 rounded-t-xl
  bg-light-code dark:bg-code
}

.rendered-text-content .code-copy svg {
  @apply w-[20px] h-[20px]
}

.edit-message-field {
  @apply w-full rounded-lg px-3 py-2
  bg-stone-200 dark:bg-stone-800 dark:text-white block
  border-blue-600 border-4 border-solid
  outline-none min-w-[200px] max-h-[500px]
  overflow-y-auto
}

</style>
<template>
  <div class="send-message-wrapper">

    <div ref="scrollDownButton" class="bg-transparent">
      <ScrollDownButton ref="scrollDownButton"/>
    </div>

    <Transition name="lazy-loading">
      <AttachedFileArea
          v-if="hasAttachedFiles"
          :height="Math.max(rows, 3) * 20 + 90"
      />
    </Transition>

    <div class="send-message-container">
      <div class="flex gap-x-2">
        <PromptImproverWrapper
            v-model="newMessage"
            :disabled="props.fieldDisabled || props.generationInProcess"
            class="w-full"
        >
          <Textarea
              v-model="newMessage"
              class="resize-none border-none p-0"
              :placeholder="placeholder"
              @keydown="handleKeydown"
              @focus="textareaFocus"
              @blur="handleTextareaBlur"
              :rows="rows"
              :disabled="props.fieldDisabled"
              ref="textarea"
          ></Textarea>
        </PromptImproverWrapper>
      </div>

      <BottomBar
          :generation-in-process="generationInProcess"
          :search-disabled="searchDisabledTrigger"
          :message="newMessage"
          @send="sendMessage"
          @searchButtonClicked="onSearchButtonClicked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {Textarea} from "~/components/ui/textarea";
import {computed, ref, nextTick} from "vue";
import ScrollDownButton from "~/components/atoms/ScrollDownButton.vue";
import {useI18n} from 'vue-i18n'
import {isIOS, isMobile} from "~/scripts/features/utils";
import {PromptImproverWrapper} from "~/components/molecules/PromptImproverWrapper";
import {AttachedFileArea, BottomBar} from "~/lib-modules/conversations";

const {t} = useI18n()


const emit = defineEmits(['send']);
const props = defineProps<{
  fieldDisabled?: boolean,
  generationInProcess: boolean
}>();

const $env = useEnv();
const {hasAttachedFiles} = useAttachMedia();

const textarea: Ref<null | HTMLInputElement> = ref(null);
const scrollDownButton: Ref<null | HTMLElement> = ref(null);

const searchDisabledTrigger = ref(false);

// ==== TEXTAREA SETTINGS ====
const ROWS_LIMIT = 7;
const newMessage = ref("");

const textareaFocus = () => {
  // Scroll handling is now done globally in telegramHack composable
}

// Flag to track search button clicks
const searchButtonClicked = ref(false);

const onSearchButtonClicked = () => {
  setTimeout(() => {
    textarea.value.textarea.focus();
  })
}

const handleTextareaBlur = (evt: FocusEvent) => {
// https://stackoverflow.com/questions/67501700/how-do-i-keep-the-focus-on-an-input-after-i-click-on-a-button-without-flickerin
}


// Calculate the number of rows based on the content
const rows = computed(() => {
  const lineCount = (newMessage.value.match(/\n/g) || []).length + 1;
  return Math.min(lineCount, ROWS_LIMIT);
});

const sendMessage = () => {
  if (useEnv().sendingMessagesBlocked.value) {
    return;
  }

  if (newMessage.value.trim()) {
    emit('send', newMessage.value);
    newMessage.value = "";

    // trigger event in BottomBar via switching state
    // searchDisabledTrigger.value = true;
    // nextTick(() => {
    //   searchDisabledTrigger.value = false;
    // })
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  // On mobile, only send on Shift+Enter or Ctrl+Enter
  // On desktop, send on Enter (without Shift)
  if (event.key === 'Enter') {
    if (isMobile()) {
      // Mobile: require Shift+Enter or Ctrl+Enter to send
      if (event.shiftKey || event.ctrlKey) {
        event.preventDefault();
        sendMessage();
      }
      // Otherwise, let Enter create a new line naturally
    } else {
      // Desktop: send on Enter, new line on Shift+Enter
      if (!event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }
  }
};

const $settings = useSettings();

const placeholder = computed(() => {
  const paid = `${t('placeholder-premium')} ${$settings.getLlm()?.title}?`;
  const free = t('placeholder');

  if ($settings.subscription.value) {
    return paid;
  }

  return free;
})

onMounted(() => {
  if (!isIOS()) {

    // scrollDownButton.value.style = 'margin-bottom : 100px'
  }
})

defineExpose({
  textarea: textarea
})

</script>

<style scoped>

.send-message-wrapper {
  /*@apply fixed bottom-0 w-full left-0 z-20;*/
}

.send-message-container {
  @apply w-full p-5 rounded-t-3xl border-x-[1px] border-t-[1px] bg-white dark:bg-black
  fixed bottom-0 left-0 z-20
}

</style>
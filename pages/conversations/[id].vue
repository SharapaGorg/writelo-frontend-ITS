<template>
  <FileDropZone/>

  <div v-show="loading" class="flex-1 flex items-center justify-center">
    <Loader type="conversation"/>
  </div>
  <MessagesSection
      :messages="messages"
      v-show="!loading"
  />

  <SendMessageSection
      :field-disabled="fieldDisabled || isSendingMessagesBlocked"
      :generation-in-process="fieldDisabled"
      @send="myNewMessage($event)"
      ref="sendMessageSection"
  />
</template>

<script setup lang="ts">
import Navbar from "~/components/organisms/Navbar.vue";
import {
  type MessageStreamData,
  type MessageType,
  Role, useCurrentConversation,
  useCurrentConversationStore,
} from "~/lib-modules/conversations";
import {MessagesSection, SendMessageSection} from "~/lib-modules/conversations";
import {ApiController} from "~/scripts/shared/api/controller";
import Loader from "~/components/atoms/Loader.vue";
import {Routes} from "~/scripts/shared/types";
import {toastAlreadyNewChat} from "~/scripts/features/utils/toater";
import {useI18n} from 'vue-i18n'
import {eventBus, type EventEditMessage} from '~/composables/eventBus'
import type {FillNewConversationType} from "~/composables/eventBus/types";
import {FeatureType} from "~/scripts/shared/types/common";
import FileDropZone from "~/components/atoms/FileDropZone.vue";
import {useTelegramViewportHack} from "~/composables/telegramHack";
import {useProjectsStore} from "~/lib-modules/projects";
import {useConversationsStore} from "~/stores/conversations";

const {t} = useI18n();
const conversationsStore = useConversationsStore();

const sendMessageSection = ref(null);

// Only use for click-outside-to-unfocus functionality
useTelegramViewportHack();

const apiController = new ApiController();
let conversation_id = computed(() => {
  return useRoute().params.id
});

const $currentConversation = useCurrentConversation();
const $conversationStore = useCurrentConversationStore();

const messages = computed({
  get() {
    return $conversationStore.messages;
  },
  set(value) {
    $conversationStore.setMessages(value);
  }
})


const isSendingMessagesBlocked = computed(() => {
  return useEnv().sendingMessagesBlocked.value;
})

const fieldDisabled = ref(false); // is send-message field disabled


const loading = computed(() => {
  return conversation_id.value !== 'new' && $conversationStore.isConversationEmpty;
})


enum Action {
  newMessage,
  reroll,
  edit
}


const myNewMessage = async (
    messageText: string,
    action: Action = Action.newMessage,
    message_id: number | undefined = undefined
) => {
  if (conversation_id.value === 'new') {
    const projectsStore = useProjectsStore();
    const newConversation = await apiController.createConversation(projectsStore.selectedProjectId);

    // Add to conversations list
    conversationsStore.addConversation({
      privateId: newConversation.privateId,
      title: newConversation.title,
      shareId: newConversation.shareId,
      createdAt: newConversation.createdAt,
      modifiedAt: newConversation.modifiedAt
    });

    await navigateTo(Routes.conversations + newConversation.privateId);

    eventBus.emit("fillNewConversation", {
      message: messageText,
      tools: settings.toolsEnabled.value
    });

    // settings.disableAllTools();
    settings.setToolState(FeatureType.search, false);

    return;
  }

  const findLastMessage = (role: Role) =>
      messages.value.findLast(message => message.role === role);

  const lastUserMessage = findLastMessage(Role.user);
  const lastAssistantMessage = findLastMessage(Role.assistant);


  if (action === Action.reroll || action === Action.edit) {
    $conversationStore.removeMessage(lastAssistantMessage.id);
  }

  const request_uuid = message_id ? message_id : (action === Action.reroll ? lastUserMessage.id : $currentConversation.addMessage(messageText));
  const response_uuid = $currentConversation.addMessage("", Role.assistant);

  fieldDisabled.value = true;

  let streamResponse;
  try {
    streamResponse = await (async () => {
      switch (action) {
        case Action.reroll:
          return apiController.rerollMessage(conversation_id.value as string, response_uuid)
        case Action.newMessage:
          return apiController.sendMessage(conversation_id.value as string, messageText, request_uuid, response_uuid);
        case Action.edit:
          await apiController.editMessage(conversation_id.value as string, message_id, messageText);
          return apiController.rerollMessage(conversation_id.value as string, response_uuid);


      }
    })();

    // Clear attached file after successful message send
    if (action === Action.newMessage) {
      const {detachAll} = useAttachMedia();
      detachAll();
    }
  } catch (error: any) {
    // Handle immediate errors (like 400 responses)
    console.error('[myNewMessage] Error caught:', error);

    const lastMessage = messages.value[messages.value.length - 1];

    // Extract error detail - the error structure from our API controller
    let errorDetail = "Failed to process your request. Please try again.";

    if (error?.data?.detail) {
      errorDetail = error.data.detail;
    }

    lastMessage.text = errorDetail;
    lastMessage.error = true;
    lastMessage.processing = false;

    // Re-enable the field
    fieldDisabled.value = false;

    // Exit early since there's no stream to process
    return;
  }

  // Handle the case where streamResponse is null (shouldn't happen with throw, but just in case)
  if (!streamResponse) {
    const lastMessage = messages.value[messages.value.length - 1];
    lastMessage.text = "Error: Failed to process your request. Please try again.";
    lastMessage.error = true;
    lastMessage.processing = false;
    fieldDisabled.value = false;
    return;
  }

  const processStreamData = (parsed: any) => {
    const actions = {
      // Новые действия согласно новому формату
      text_chunk: () => {
        messages.value[messages.value.length - 1].text += parsed.dt
      },
      request_message_id: () => {
        // Обновляем ID сообщения-запроса
        const requestMessage = messages.value[messages.value.length - 2];
        if (requestMessage && typeof requestMessage.id === 'string') {
          requestMessage.id = parsed.messageId;
        }
      },
      response_message_id: () => {
        // Обновляем ID сообщения-ответа
        const responseMessage = messages.value[messages.value.length - 1];
        if (responseMessage) {
          responseMessage.id = parsed.messageId;
          useEnv().processMessageId.value = parsed.messageId;
        }
      },
      response_end: () => {
        useEnv().processMessageId.value = null;

        fieldDisabled.value = false;
        if (!parsed.success) {
          messages.value[messages.value.length - 1].text += parsed.message || " \n**Server is busy**";
          messages.value[messages.value.length - 1].error = true;
        }

        messages.value[messages.value.length - 1].processing = false;
      },
      set_title: () => {
        console.log('[set_title] emitting dialogTitleUpdated', {
          conversation_id: conversation_id.value,
          title: parsed.title
        });
        useCurrentConversationStore().setTitle(parsed.title);

        eventBus.emit('dialogTitleUpdated', {
          conversation_id: conversation_id.value,
          title: parsed.title
        });
      },
      // Старые действия для обратной совместимости
      process_response: () => {
        messages.value[messages.value.length - 1].text += parsed.dt
        useEnv().processMessageId.value = parsed.message_id;
      },
      message_ids_replace: () => {
        Object.entries(parsed.map || {}).forEach(([uuid, newId]) => {
          messages.value.forEach(message => {
            if (message.id === uuid) message.id = newId;
          });
        });
      },
      finish_response: () => {
        useEnv().processMessageId.value = null;

        fieldDisabled.value = false;
        if (!parsed.success) {
          messages.value[messages.value.length - 1].text += parsed.error || " \n**Server is busy**";
          messages.value[messages.value.length - 1].error = true;
        }

        messages.value[messages.value.length - 1].processing = false;
      }
    };


    actions[parsed.action]?.();
  };

  settings.disableAllTools();

  const reader = streamResponse.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, {stream: true});

    while (true) {
      const lineEnd = buffer.indexOf('\n');
      if (lineEnd === -1) break;

      const line = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);

      if (line.startsWith('data: ')) {
        try {
          processStreamData(JSON.parse(line.slice(6)));
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    }
  }
};


const reroll = () => {
  myNewMessage(null, Action.reroll);
}

const editMessage = async (data: EventEditMessage) => {
  await myNewMessage(data.newText, Action.edit, data.messageId);
}

const fillNewConversation = async (data: FillNewConversationType) => {
  // for (let tool of data.tools) {
  //   useSettings().setToolState(tool, true);
  // }

  await myNewMessage(data.message);

}
const stopGeneration = async () => {
  fieldDisabled.value = false;
  await apiController.stopGeneration(conversation_id.value);
}


onBeforeMount(async () => {
  if (conversation_id.value === 'new') {
    return;
  }

  eventBus.on('fillNewConversation', fillNewConversation);

  let response = await apiController.getConversation(conversation_id.value);

  if (response?.messages?.length) {
    messages.value = response.messages;
  }

  await nextTick(() => {
    useCurrentConversationStore().setTitle(response.title);
  })

  eventBus.on('rerollMessage', reroll);
  eventBus.on('editMessage', editMessage)
  eventBus.on('stopGeneration', stopGeneration);
})


onUnmounted(() => {
  eventBus.off('rerollMessage', reroll);
  eventBus.off('fillNewConversation', fillNewConversation);
  eventBus.off('editMessage', editMessage);
  eventBus.off('stopGeneration', stopGeneration);
})

</script>

<style src="@/assets/css/index.css"></style>

<style scoped>
.transition-height {
  transition: height 0.25s cubic-bezier(.4, 0, .2, 1);
}
</style>
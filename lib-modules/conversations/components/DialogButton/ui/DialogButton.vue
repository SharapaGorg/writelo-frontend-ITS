<script setup lang="ts">

import {Routes} from "~/scripts/shared/types";
import {Button} from "~/components/ui/button";
import {Trash, Lock, LockOpen} from "lucide-vue-next";
import RemoveConfirmationAlert from "./RemoveConfirmationAlert.vue";
import {useConversationsStore} from "~/stores/conversations";

const conversationStore = useConversationsStore();

const props = defineProps<{
  privateId: string,
  title: string,
  shareId: string | null
}>();

const lockClick = () => {
  if (props.shareId) {
    conversationStore.shareConversation(props.privateId);
  };
}

</script>

<template>
  <div class="flex items-center gap-x-2 w-full pr-2">
    <router-link
        class="flex-grow"
        :key="privateId"
        :to="Routes.conversations + privateId"
    >
      <Button
          class="w-full overflow-hidden text-ellipsis justify-start"
          variant="outline"
      >{{ title }}
      </Button>
    </router-link>

    <div class="flex items-center gap-x-2">
      <component
          :is="shareId ? LockOpen : Lock"
          class="trash-button"
          @click="lockClick"
      />

      <RemoveConfirmationAlert :dialog-title="title" @approve="conversationStore.removeConversation(privateId, $t)">
        <Trash class="trash-button"/>
      </RemoveConfirmationAlert>
    </div>
  </div>
</template>

<style scoped>

.trash-button {
  @apply w-5 h-5 flex-shrink-0
  cursor-pointer
}

</style>
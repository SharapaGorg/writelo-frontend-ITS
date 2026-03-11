<template>
  <div>
    <ProjectTabs/>

    <Accordion type="single" collapsible class="px-2 py-2">
      <div
          v-if="!groups.length && !projectsStore.loading"
          class="text-lg px-2"
      >
        {{ t('no-conversations') }}
      </div>

      <div>
        <Spinner v-show="projectsStore.loading"/>

        <AccordionItem
            v-for="section in groups"
            :key="section.key + (projectsStore.selectedProjectId ?? 'all')"
            :value="section.key"
        >
          <AccordionTrigger>
            {{ t(section.label) }}
          </AccordionTrigger>

          <AccordionContent class="dialog-accordion-content">
            <div
                v-for="chat in section.chats"
                :key="chat.privateId"
            >
              <MenuDialogButton
                  :title="chat.title"
                  :private-id="chat.privateId"
                  :share-id="chat.shareId"
                  v-if="!conversationsStore.isConversationRemoved(chat.privateId)"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useConversationsStore} from '~/stores/conversations'
import {ProjectTabs, useProjectsStore} from '~/lib-modules/projects'
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '~/components/ui/accordion'
import Spinner from '~/components/atoms/Spinner.vue'
import type {ChatsGroupSection} from "~/lib-modules/conversations";
import {MenuDialogButton} from "~/lib-modules/conversations";

const {t} = useI18n()
const conversationsStore = useConversationsStore()
const projectsStore = useProjectsStore()

/**
 * ✅ computed: выбор источника данных по текущему проекту
 * - если проекта нет → показываем global conversations
 * - если есть → показываем project-specific currentGroups
 */
const groups = computed<ChatsGroupSection[]>(() => {
  if (projectsStore.selectedProjectId === null) {
    return conversationsStore.groups
  }
  return projectsStore.currentGroups
})
</script>

<style>
.dialog-accordion-content {
  @apply flex flex-col gap-y-1 transition-all duration-300 max-h-[260px] overflow-y-auto
  scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent;
}
</style>

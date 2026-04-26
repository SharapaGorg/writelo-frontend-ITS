<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onUnmounted } from 'vue'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  PostPreviewPanel,
  useContentEditorStore,
} from '~/lib-modules/content-editor'

const store = useContentEditorStore()
const { editorMode } = storeToRefs(store)

// Seed synchronously in setup so the slotted panels (PostPreviewPanel guards on
// currentDraft) see the demo state on their first render — onMounted would fire
// after children mount, leaving an empty initial frame.
store.setEditorMode('chat')
store.loadDraft({
  id: 'landing-demo-post',
  type: 'post',
  accountId: 'landing-demo-account',
  title: 'Запуск весенней коллекции',
  description:
    'Весна — время обновлений. Новая коллекция уже в магазине: лёгкие ткани, спокойные цвета, силуэты, в которых хочется ходить каждый день.\n\nСмотрите по ссылке в шапке профиля и выбирайте своё.',
  scheduledDate: '2026-04-29T10:00',
  status: 'idea',
})
store.loadChatMessages([
  {
    id: 1,
    role: 1,
    text: 'Напиши пост-анонс новой весенней коллекции для бренда одежды. Тон — спокойный, без восклицательных знаков.',
    createdAt: '2026-04-26T09:00:00Z',
  },
  {
    id: 2,
    role: 0,
    text: 'Готово. Сделал в духе бренда: акцент на ощущении и на том, что коллекция уже доступна. Без давления и кричащих фраз.\n\n*Весна — время обновлений. Новая коллекция уже в магазине: лёгкие ткани, спокойные цвета, силуэты, в которых хочется ходить каждый день.*\n\n*Смотрите по ссылке в шапке профиля и выбирайте своё.*\n\nХочешь — добавлю CTA посильнее или сделаю версию для сторис.',
    createdAt: '2026-04-26T09:00:12Z',
  },
  {
    id: 3,
    role: 1,
    text: 'Норм, оставим так. Подбери ещё 5 хэштегов под Instagram.',
    createdAt: '2026-04-26T09:00:45Z',
  },
  {
    id: 4,
    role: 0,
    text: '#весна2026 #новаяколлекция #женскаяодежда #базовыйгардероб #lookoftheday',
    createdAt: '2026-04-26T09:00:52Z',
  },
])

onUnmounted(() => {
  // Demo state lives in the same Pinia store as /app/editor — clear it so the
  // real editor doesn't inherit the showcase draft on next navigation.
  store.clearDraft()
})
</script>

<template>
  <ContentEditorLayout :showcase-mode="true">
    <template #left-panel>
      <EditorChatPanel v-if="editorMode === 'chat'" :showcase-mode="true" />
      <EditorImagesPanel v-else />
    </template>
    <template #right-panel>
      <PostPreviewPanel :showcase-mode="true" />
    </template>
  </ContentEditorLayout>
</template>

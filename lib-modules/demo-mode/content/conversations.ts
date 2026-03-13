// lib-modules/demo-mode/content/conversations.ts

import type { ShortConversationType, ConversationType, FileType } from '~/lib-modules/conversations'
import { Role } from '~/lib-modules/conversations'
import { CONTENT_PLAN_RESPONSE, REELS_IDEAS_RESPONSE } from './responses'

// Short conversations for sidebar
export const demoConversations: ShortConversationType[] = [
  {
    privateId: 'demo-content-plan',
    title: 'Контент-план Кофейни Зерно',
    shareId: null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  },
  {
    privateId: 'demo-reels-ideas',
    title: '10 идей для Reels',
    shareId: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    modifiedAt: new Date(Date.now() - 3600000).toISOString()
  }
]

// Full conversation with messages
export const demoConversationsFull: Record<string, ConversationType> = {
  'demo-content-plan': {
    privateId: 'demo-content-plan',
    title: 'Контент-план Кофейни Зерно',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    messages: [
      {
        id: 1,
        role: Role.user,
        text: 'Вы — "GPT-маркетолог". Создайте контент-план для кофейни "Зерно" на март 2026.',
        file: null as unknown as FileType,
        files: [],
        createdAt: new Date().toISOString(),
        processing: false,
        error: false
      },
      {
        id: 2,
        role: Role.assistant,
        text: CONTENT_PLAN_RESPONSE,
        file: null as unknown as FileType,
        createdAt: new Date().toISOString(),
        files: [],
        processing: false,
        error: false
      }
    ]
  },
  'demo-reels-ideas': {
    privateId: 'demo-reels-ideas',
    title: '10 идей для Reels',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    modifiedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: 1,
        role: Role.user,
        text: 'Придумай 10 идей для Reels для кофейни "Зерно"',
        file: null as unknown as FileType,
        files: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        processing: false,
        error: false
      },
      {
        id: 2,
        role: Role.assistant,
        text: REELS_IDEAS_RESPONSE,
        file: null as unknown as FileType,
        files: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        processing: false,
        error: false
      }
    ]
  }
}

export function isDemoConversation(privateId: string): boolean {
  return privateId.startsWith('demo-')
}

export function getDemoConversation(privateId: string): ConversationType | null {
  return demoConversationsFull[privateId] || null
}

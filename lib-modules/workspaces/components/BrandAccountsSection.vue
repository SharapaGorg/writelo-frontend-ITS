<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Loader2, Plus, MoreVertical, Trash2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'

const { t } = useI18n()
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { SocialAccount } from '~/lib-modules/content-calendar/types'

defineProps<{
  workspaceId: string
  accounts: SocialAccount[]
  loading: boolean
  loaded: boolean
  canManage: boolean
}>()

const emit = defineEmits<{
  unlink: [accountId: string]
}>()

function goToConnect(workspaceId: string) {
  navigateTo(`/app/connect-account?workspaceId=${encodeURIComponent(workspaceId)}`)
}
</script>

<template>
  <div class="space-y-2 pb-4 border-b border-border">
    <div class="flex items-center justify-between">
      <Label>{{ t('brandAccounts.header') }}</Label>
      <Button
        v-if="loaded && accounts.length > 0 && canManage"
        variant="ghost"
        size="sm"
        class="gap-1.5 h-7 text-xs"
        @click="goToConnect(workspaceId)"
      >
        <Plus class="h-3.5 w-3.5" />
        {{ t('brandAccounts.add') }}
      </Button>
    </div>

    <div
      v-if="loading && !loaded"
      class="flex items-center gap-2 py-3 text-sm text-muted-foreground"
    >
      <Loader2 class="h-4 w-4 animate-spin" />
      {{ t('brandAccounts.loading') }}
    </div>

    <div v-else-if="accounts.length > 0" class="flex flex-wrap gap-2">
      <div
        v-for="a in accounts"
        :key="a.id"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30"
      >
        <span
          :class="[
            'w-5 h-5 rounded flex items-center justify-center text-white shrink-0',
            a.network === 'telegram' && 'bg-sky-500',
            a.network === 'vk' && 'bg-blue-600',
            a.network === 'instagram' && 'bg-gradient-to-br from-purple-500 to-pink-500',
            a.network === 'youtube' && 'bg-red-600',
          ]"
        >
          <svg v-if="a.network === 'telegram'" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <svg v-else-if="a.network === 'vk'" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
          </svg>
          <svg v-else-if="a.network === 'instagram'" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
          <svg v-else-if="a.network === 'youtube'" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </span>
        <span class="text-sm font-medium truncate max-w-[12rem]">{{ a.name }}</span>
        <span v-if="a.username" class="text-xs text-muted-foreground truncate max-w-[10rem]">
          {{ a.username }}
        </span>
        <DropdownMenu v-if="canManage">
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="ml-1 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              :aria-label="t('brandAccounts.actions')"
            >
              <MoreVertical class="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              class="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
              @click="emit('unlink', a.id)"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              {{ t('brandAccounts.unlink') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div
      v-else-if="loaded"
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-3 rounded-md border border-dashed border-border bg-muted/20"
    >
      <p class="text-sm text-muted-foreground">
        {{ t('brandAccounts.empty') }}
      </p>
      <Button v-if="canManage" size="sm" class="gap-1.5" @click="goToConnect(workspaceId)">
        <Plus class="h-4 w-4" />
        {{ t('brandAccounts.connect') }}
      </Button>
    </div>
  </div>
</template>

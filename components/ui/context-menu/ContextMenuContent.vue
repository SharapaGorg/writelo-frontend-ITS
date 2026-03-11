<script setup lang="ts">
import { ContextMenuContent, type ContextMenuContentProps, useForwardProps } from 'reka-ui'
import { cn } from '~/lib-modules/utils'

const props = withDefaults(defineProps<ContextMenuContentProps>(), {
  sideOffset: 4,
})

const forwardedProps = useForwardProps(props)
</script>

<template>
  <ContextMenuContent
    v-bind="forwardedProps"
    :class="cn(
      'z-50 min-w-32 overflow-hidden rounded-md border border-stone-200 bg-white p-1 text-stone-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50',
      props.class,
    )"
  >
    <slot />
  </ContextMenuContent>
</template>
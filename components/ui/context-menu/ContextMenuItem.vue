<script setup lang="ts">
import { ContextMenuItem, type ContextMenuItemProps, useForwardProps } from 'reka-ui'
import { cn } from '~/lib-modules/utils'

const props = defineProps<ContextMenuItemProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <ContextMenuItem
    v-bind="forwardedProps"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-stone-100 focus:text-stone-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-stone-800 dark:focus:text-stone-50',
      props.class,
    )"
  >
    <slot />
  </ContextMenuItem>
</template>
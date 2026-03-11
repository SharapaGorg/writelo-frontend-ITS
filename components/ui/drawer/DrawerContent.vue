<script lang="ts" setup>
import type {DialogContentEmits, DialogContentProps} from 'reka-ui'
import type {HtmlHTMLAttributes} from 'vue'
import {cn} from '@/lib-modules/utils'
import {useForwardPropsEmits} from 'reka-ui'
import {DrawerContent, DrawerPortal} from 'vaul-vue'
import DrawerOverlay from './DrawerOverlay.vue'

const props = defineProps<DialogContentProps & { class?: HtmlHTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay/>
    <DrawerContent
        v-bind="forwarded" :class="cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border border-stone-200 dark:border-stone-800 dark:bg-stone-950',
        props.class,
      )"
    >
      <div class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-stone-100 dark:bg-stone-800"/>
      <slot/>
    </DrawerContent>
  </DrawerPortal>
</template>

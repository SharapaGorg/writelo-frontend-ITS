<script setup lang="ts">

import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";

const props = defineProps({
  options: Array<String>,
  placeholder: String,
  disabled: Boolean
})

</script>

<template>
  <Select :disabled="disabled">
    <SelectTrigger>
      <SelectValue :placeholder="placeholder"/>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
            class="cursor-pointer"
            v-for="option in options"
            :key="option"
            :value="option"
        >
          {{ option }}
        </SelectItem>

        <slot></slot>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped>

</style>
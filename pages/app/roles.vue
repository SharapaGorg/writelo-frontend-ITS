<template>
  <div class="p-10 gap-10 grid grid-cols-2 w-fit">
    <Role
        v-for="role in roles"
        :key="role.id"
        :image="'/roles/' + role.icon + '.png'"
        :name="role.name"
    />
    <div v-if="!roles.length" class="text-zinc-500">
      {{ $t('no-roles') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Role from "~/components/molecules/Role.vue";
import { useSettings } from '~/composables/settings'

const settings = useSettings()

const roles = computed(() => settings.getConfig()?.roles ?? [])
</script>

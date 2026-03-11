<template>
  <div class="p-10 gap-10 grid grid-cols-2 w-fit">
    <Role
        v-for="role in roles"
        :key="role.name"
        :image="role.image"
        :name="role.name"
    />
  </div>
</template>

<script setup lang="ts">

import Role from "~/components/molecules/Role.vue";

type Role = {
  image: string,
  name: string,
  description?: string,
  dialog?: string // example of a dialog
}

const roles: Role[] = [
  {
    image: "/roles/sherlok.png",
    name: "Маэстро идей"
  },
  {
    image: "/roles/sherlok.png",
    name: "Детектив"
  },
  {
    image: "/roles/smart1.png",
    name: "Философ"
  },
  {
    image: "/roles/sherlok.png",
    name: "Хакер"
  },
]

</script>

<style scoped>

</style>
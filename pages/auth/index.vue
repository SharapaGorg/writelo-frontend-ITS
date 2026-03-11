<template>
  <div class="flex items-center justify-center h-full w-full">
    <AuthForm/>
  </div>
</template>

<script setup lang="ts">

import {AuthForm} from "~/lib-modules/web-auth";
import {definePageMeta} from "#imports";

definePageMeta({
  layout: false
})

</script>

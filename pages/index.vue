<template>
  <div class="h-screen flex items-center justify-center">
    <Loader type="default" size="large" />
  </div>
</template>

<script setup lang="ts">

import {Routes} from "~/scripts/shared/types";
import Loader from "~/components/atoms/Loader.vue";

navigateTo(Routes.newConversation);

</script>
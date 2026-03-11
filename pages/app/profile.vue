<script setup lang="ts">
import {ProfilePage} from "~/lib-modules/profile";
import {useCurrentConversation} from "~/lib-modules/conversations";

useCurrentConversation().clearConversation();
</script>

<template>
  <div class="basic-page-wrapper">
    <ProfilePage/>
  </div>
</template>
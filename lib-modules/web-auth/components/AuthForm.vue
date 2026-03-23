<script setup lang="ts">

import SignUpForm from './SignUpForm.vue';
import LoginForm from './LoginForm.vue';

type AuthView = 'signup' | 'login'

const currentView = ref<AuthView>('signup')

</script>

<template>
  <div class="w-full md:w-[500px] px-2">
    <LoginForm
        v-if="currentView === 'login'"
        @signup="currentView = 'signup'"
    />
    <SignUpForm
        v-else
        @login="currentView = 'login'"
    />
  </div>
</template>

<style scoped>

</style>

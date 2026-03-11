<script setup lang="ts">

import SignUpForm from './SignUpForm.vue';
import LoginForm from './LoginForm.vue';
import LanguageSelector from '~/components/atoms/LanguageSelector.vue';

type AuthView = 'signup' | 'login'

const currentView = ref<AuthView>('signup')

</script>

<template>
  <div class="relative w-full md:w-[500px] px-2">
    <div class="absolute top-0 right-2 -mt-10">
      <LanguageSelector/>
    </div>

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

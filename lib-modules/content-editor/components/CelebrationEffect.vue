<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
}>(), {
  duration: 3000
})

const emit = defineEmits<{
  complete: []
}>()

const isVisible = ref(true)
const particles = ref<Array<{
  id: number
  emoji: string
  left: number
  delay: number
  duration: number
}>>([])

const emojis = ['🎉', '🎊', '✨', '🚀', '⭐', '💫', '🌟', '🎯']

onMounted(() => {
  // Generate particles
  for (let i = 0; i < 30; i++) {
    particles.value.push({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5
    })
  }

  // Hide after duration
  setTimeout(() => {
    isVisible.value = false
    emit('complete')
  }, props.duration)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute text-2xl animate-fall"
        :style="{
          left: `${particle.left}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`
        }"
      >
        {{ particle.emoji }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(0.5);
    opacity: 0;
  }
}

.animate-fall {
  animation: fall ease-out forwards;
}
</style>

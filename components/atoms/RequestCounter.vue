<template>
  <div class="request-counter">
    <div class="request-counter__header">
      <h3 class="request-counter__title">{{ $t('requestCounter.title') }}</h3>
    </div>
    
    <div class="request-counter__content">
      <div class="request-counter__item">
        <div class="request-counter__label">
          <span class="request-counter__label-text">{{ $t('requestCounter.basic') }}</span>
        </div>
        <div class="request-counter__value">
          <span class="request-counter__remaining">{{ basicRemaining }}</span>
          <span class="request-counter__separator">/</span>
          <span class="request-counter__total">{{ basicTotal }}</span>
        </div>
      </div>
      
      <div class="request-counter__item">
        <div class="request-counter__label">
          <span class="request-counter__label-text">{{ $t('requestCounter.premium') }} ⭐</span>
<!--          <Crown class="request-counter__crown-icon" />-->
        </div>
        <div class="request-counter__value">
          <span class="request-counter__remaining">{{ premiumRemaining }}</span>
          <span class="request-counter__separator">/</span>
          <span class="request-counter__total">{{ premiumTotal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crown } from 'lucide-vue-next'

interface Props {
  basicRemaining?: number
  basicTotal?: number
  premiumRemaining?: number
  premiumTotal?: number
}

withDefaults(defineProps<Props>(), {
  basicRemaining: 0,
  basicTotal: 10,
  premiumRemaining: 0,
  premiumTotal: 100,
})
</script>

<style scoped>
.request-counter {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.request-counter__header {
  margin-bottom: 12px;
}

.request-counter__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.request-counter__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-counter__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-counter__label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.request-counter__label-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.request-counter__crown-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-color);
}

.request-counter__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 16px;
  font-weight: 500;
}

.request-counter__remaining {
  color: var(--text-primary);
}

.request-counter__separator {
  color: var(--text-tertiary);
  font-size: 14px;
}

.request-counter__total {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
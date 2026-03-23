<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="w-[95vw] lg:w-[400px]">
      <DialogHeader>
        <DialogTitle>{{ $t('payment-providers') }}</DialogTitle>
      </DialogHeader>


      <div class="flex flex-col gap-y-2">
        <Button @click="$emit('select-method', PaymentProvider.tinkoff); isOpen = false">
          <div class="flex items-center gap-x-2">
            <CreditCard/>
            <div>{{ $t('bank-card') }}</div>
          </div>
        </Button>

        <Button variant="secondary" @click="$emit('select-method', PaymentProvider.cryptoBot); isOpen = false">
          <div class="flex items-center gap-x-2">
            <Bitcoin class="w-6"/>
            <div>{{ $t('crypto-bot') }}</div>
          </div>
        </Button>


        <Button variant="telegram" @click="$emit('select-method', PaymentProvider.stars); isOpen = false">
          <div class="flex items-center gap-x-2">
            <Star class="w-6"/>
            <div>{{ $t('telegram-stars') }}</div>
          </div>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "~/components/ui/dialog";
import {CreditCard, Bitcoin, Star} from "lucide-vue-next";
import PaymentProviders from "~/components/atoms/PaymentProviders.vue";
import {PaymentProvider} from "~/scripts/shared/types/payment";

const emit = defineEmits(['select-method'])

const isOpen = ref(false);

</script>

<style scoped>

</style>
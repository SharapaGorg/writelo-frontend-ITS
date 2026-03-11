<script setup lang="ts">
import {Button} from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import Tier from "~/components/molecules/Tier.vue";



</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Специальное предложение</DialogTitle>
        <!--        <DialogDescription>-->
        <!--          Доступные пользователям уровни подписки-->
        <!--        </DialogDescription>-->
      </DialogHeader>

      <Tier
          title="Премиум"
          :price="500"
          :new-price="400"
          :rows="['Бе', 'Пла', 'Тно']"
      />

      <DialogFooter class="sm:justify-start">
        <!--        <DialogClose as-child>-->
        <!--          <Button type="button" variant="outline">-->
        <!--            Закрыть-->
        <!--          </Button>-->
        <!--        </DialogClose>-->
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
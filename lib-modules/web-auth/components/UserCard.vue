<!--
Компонент карточки юзера, при нажатии на который, будут открываться настройки профиля
Соответственно, показываться этот компонент будет только в браузере, в миниаппе будет виден, только если аккаунт есть глобальный
-->

<template>
  <Card class="user-card__container">
    <CardContent class="px-2">
      <div class="flex items-center gap-3 relative">
        <Button size="icon" class="absolute right-0 " variant="ghost" style="padding : 0">
          <SquarePen class="w-[14px] h-[14px]"/>
        </Button>

        <!-- Avatar -->
        <Avatar class="h-8 w-8 bg-zinc-600 flex-shrink-0">
          <AvatarImage :src="user.avatar" :alt="user.name"/>
          <AvatarFallback class="bg-zinc-600 text-zinc-200 text-sm font-medium flex items-center justify-center">
            {{ getInitials(user.name) }}
          </AvatarFallback>
        </Avatar>

        <!-- User Info -->
        <div class="flex-1 min-w-0 text-start">
          <h3 class="text-zinc-800 dark:text-zinc-100 font-medium text-sm truncate">
            {{ user.name }}
          </h3>
          <p class="text-zinc-500 dark:text-zinc-400 text-xs">
            {{ user.plan }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {Button} from '~/components/ui/button'
import {Avatar, AvatarImage, AvatarFallback} from "~/components/ui/avatar";
import {SquarePen} from 'lucide-vue-next'

const user = {
  name: 'Sharapa Gorg',
  plan: 'Free',
  avatar: '' // можете добавить URL изображения если нужно
}

const getInitials = (name: string): string => {
  return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
}
</script>

<style scoped>

.user-card__container {
  @apply
  w-full md:w-64 bg-white dark:bg-zinc-900
  hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer py-2
}

</style>
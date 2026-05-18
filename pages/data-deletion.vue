<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
})

useSeoMeta({
  title: 'Удаление данных — Writelo',
  description: 'Как удалить аккаунт Writelo и все связанные с ним данные, включая данные подключённых соцсетей.',
  robots: 'index, follow',
})

useHead({
  htmlAttrs: { lang: 'ru' },
})
</script>

<template>
  <div class="legal-doc-root h-screen overflow-y-auto bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#ede8de]">
    <header class="border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
      <div class="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        <NuxtLink to="/" class="font-bold text-[18px] tracking-[-0.02em]">Writelo</NuxtLink>
        <NuxtLink to="/" class="text-sm text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">← На главную</NuxtLink>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold tracking-[-0.02em] mb-2">Удаление данных</h1>
      <p class="text-sm text-[#5f5f5f] dark:text-[#a8a094] mb-10">Последнее обновление: 18 мая 2026 г.</p>

      <div class="space-y-8 text-[15px] leading-[1.7]">
        <section>
          <p>
            Вы можете в любой момент удалить свой аккаунт Writelo и все связанные с ним данные,
            включая данные, полученные через подключённые соцсети (Instagram, Facebook, Telegram).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Как удалить</h2>
          <p class="mb-4">Отправьте письмо со следующими данными:</p>

          <div class="bg-[#fafaf9] dark:bg-[#161412] border border-[#0a0a0a]/10 dark:border-[#ede8de]/10 rounded-lg p-5 mb-4">
            <div class="space-y-2 text-sm">
              <div><span class="text-[#5f5f5f] dark:text-[#a8a094]">Кому:</span> <a href="mailto:hello@writelo.io?subject=Delete%20my%20data" class="font-mono underline">hello@writelo.io</a></div>
              <div><span class="text-[#5f5f5f] dark:text-[#a8a094]">Тема:</span> <span class="font-mono">Delete my data</span></div>
              <div><span class="text-[#5f5f5f] dark:text-[#a8a094]">Текст:</span> укажите email, на который зарегистрирован аккаунт, и подтвердите запрос на удаление</div>
            </div>
          </div>

          <p>
            Письмо должно быть отправлено с того же email, который привязан к аккаунту — это
            подтверждает, что владелец аккаунта именно вы.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Сроки</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>Подтверждение получения запроса — в течение 1 рабочего дня.</li>
            <li>Удаление аккаунта и данных — в течение 30 дней.</li>
            <li>Перезапись резервных копий — в течение 90 дней.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Что удаляется</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>профиль и данные аккаунта (имя, email, пароль);</li>
            <li>токены доступа подключённых соцсетей;</li>
            <li>данные, полученные через Instagram Graph API и другие интеграции;</li>
            <li>созданные посты, черновики, расписания и загруженные медиа;</li>
            <li>история действий, заметки и настройки.</li>
          </ul>
          <p class="mt-3 text-sm text-[#5f5f5f] dark:text-[#a8a094]">
            Юридически обязательные записи (например, документы об оплате) сохраняются в течение
            срока, установленного законом.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Отзыв доступа на стороне соцсети</h2>
          <p class="mb-3">
            В дополнение к удалению аккаунта Writelo вы можете отозвать доступ нашего приложения
            непосредственно в настройках соцсети — это полезно, если вы хотите оставить аккаунт
            Writelo, но прервать связь с конкретной платформой:
          </p>
          <ul class="list-disc pl-6 space-y-1">
            <li>
              <strong>Instagram / Facebook:</strong>
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                target="_blank"
                rel="noopener noreferrer"
                class="underline"
              >Meta Business Tools → удалить Writelo</a>;
            </li>
            <li>
              <strong>Telegram:</strong> Settings → Privacy and Security → Active Sessions →
              завершить сессию Writelo.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Вопросы</h2>
          <p>
            Если у вас остались вопросы — пишите на
            <a href="mailto:hello@writelo.io" class="underline">hello@writelo.io</a>.
          </p>
        </section>
      </div>

      <footer class="mt-16 pt-8 border-t border-[#0a0a0a]/10 dark:border-[#ede8de]/10 flex items-center justify-between text-sm text-[#5f5f5f] dark:text-[#a8a094]">
        <NuxtLink to="/privacy" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Политика конфиденциальности</NuxtLink>
        <NuxtLink to="/terms" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Условия использования</NuxtLink>
      </footer>
    </main>
  </div>
</template>

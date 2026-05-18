<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
})

useSeoMeta({
  title: 'Условия использования — Writelo',
  description: 'Условия использования сервиса Writelo: права и обязанности пользователя, подключение соцсетей, подписка.',
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
      <h1 class="text-3xl font-bold tracking-[-0.02em] mb-2">Условия использования</h1>
      <p class="text-sm text-[#5f5f5f] dark:text-[#a8a094] mb-10">Последнее обновление: 18 мая 2026 г.</p>

      <div class="space-y-8 text-[15px] leading-[1.7]">
        <section>
          <p>
            Настоящие Условия регулируют использование сервиса Writelo (далее — «Сервис»),
            доступного по адресу writelo.io. Создавая аккаунт или используя Сервис, вы
            подтверждаете, что прочитали, поняли и согласны с этими Условиями и
            <NuxtLink to="/privacy" class="underline">Политикой конфиденциальности</NuxtLink>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">1. О Сервисе</h2>
          <p>
            Writelo — инструмент для планирования, создания и публикации контента в социальных
            сетях, а также аналитики трендов и эффективности публикаций. Сервис предоставляется
            «как есть» и постоянно развивается; функции могут добавляться, изменяться или
            удаляться.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">2. Регистрация</h2>
          <p class="mb-3">
            Чтобы пользоваться Сервисом, нужно зарегистрировать аккаунт. Вы обязуетесь:
          </p>
          <ul class="list-disc pl-6 space-y-1">
            <li>предоставить достоверную информацию (имя, email);</li>
            <li>обеспечивать сохранность пароля и не передавать доступ к аккаунту третьим лицам;</li>
            <li>немедленно уведомить нас о любом несанкционированном доступе.</li>
          </ul>
          <p class="mt-3">
            Использовать Сервис могут лица, достигшие 16 лет.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">3. Допустимое использование</h2>
          <p class="mb-3">При использовании Сервиса <strong>запрещается</strong>:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>нарушать законы РФ или страны проживания пользователя;</li>
            <li>публиковать контент, нарушающий правила соответствующей соцсети
              (Instagram Community Guidelines, Telegram ToS и т.п.);</li>
            <li>осуществлять спам, фишинг, рассылку вредоносного ПО;</li>
            <li>публиковать контент, нарушающий авторские права третьих лиц;</li>
            <li>пытаться получить несанкционированный доступ к Сервису или другим аккаунтам;</li>
            <li>использовать автоматизированные средства, не предусмотренные публичным API.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">4. Подключение соцсетей</h2>
          <p class="mb-3">
            При подключении аккаунта Instagram, Facebook, Telegram или другой соцсети вы
            предоставляете Сервису разрешения, явно перечисленные на экране авторизации
            соответствующей платформы. Сервис использует эти разрешения только для выполнения
            функций, которые вы инициируете (например, публикации поста).
          </p>
          <p class="mb-3">
            Использование данных, полученных через Meta-платформы, регулируется
            <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" class="underline">Meta Platform Terms</a>
            и
            <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" class="underline">Developer Policies</a>.
          </p>
          <p>
            Вы можете в любой момент отвязать аккаунт соцсети в интерфейсе Writelo или отозвать
            доступ в настройках самой платформы.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">5. Подписка и оплата</h2>
          <p class="mb-3">
            У Сервиса есть бесплатный тариф с ограничениями и платные подписки. Условия каждого
            тарифа описаны на странице <NuxtLink to="/app/plans" class="underline">«Тарифы»</NuxtLink>.
          </p>
          <p>
            Оплата производится через платёжного провайдера. Подписка возобновляется
            автоматически, если иное не указано. Вы можете отменить подписку в любой момент в
            профиле; доступ сохранится до конца оплаченного периода.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">6. Контент пользователя</h2>
          <p>
            Все права на контент, который вы создаёте и загружаете в Сервис, принадлежат вам. Вы
            предоставляете Сервису ограниченную лицензию на хранение, обработку и публикацию этого
            контента — исключительно для выполнения ваших инструкций.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">7. Прекращение доступа</h2>
          <p>
            Мы можем приостановить или прекратить доступ к Сервису, если вы существенно нарушаете
            настоящие Условия. Вы можете удалить аккаунт в любое время —
            см. <NuxtLink to="/data-deletion" class="underline">инструкцию по удалению</NuxtLink>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">8. Отказ от ответственности</h2>
          <p>
            Сервис предоставляется «как есть» без каких-либо гарантий. Мы не отвечаем за
            недоступность сторонних платформ (Instagram, Facebook, Telegram), за изменения их API
            или за решения, которые они принимают в отношении вашего контента или аккаунта. Мы
            не отвечаем за упущенную выгоду и косвенный ущерб в пределах, разрешённых законом.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">9. Изменения Условий</h2>
          <p>
            Мы можем обновлять Условия. О существенных изменениях уведомим заранее по email или
            баннером в приложении. Продолжение использования Сервиса после вступления в силу
            новых Условий означает согласие с ними.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">10. Контакты</h2>
          <p>
            По вопросам, связанным с Условиями, пишите на
            <a href="mailto:hello@writelo.io" class="underline">hello@writelo.io</a>.
          </p>
        </section>
      </div>

      <footer class="mt-16 pt-8 border-t border-[#0a0a0a]/10 dark:border-[#ede8de]/10 flex items-center justify-between text-sm text-[#5f5f5f] dark:text-[#a8a094]">
        <NuxtLink to="/privacy" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Политика конфиденциальности</NuxtLink>
        <NuxtLink to="/data-deletion" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Удаление данных</NuxtLink>
      </footer>
    </main>
  </div>
</template>

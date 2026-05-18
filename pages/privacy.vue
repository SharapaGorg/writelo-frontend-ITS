<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
})

useSeoMeta({
  title: 'Политика конфиденциальности — Writelo',
  description: 'Политика конфиденциальности сервиса Writelo: какие данные мы собираем, как используем и как их удалить.',
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
      <h1 class="text-3xl font-bold tracking-[-0.02em] mb-2">Политика конфиденциальности</h1>
      <p class="text-sm text-[#5f5f5f] dark:text-[#a8a094] mb-10">Последнее обновление: 18 мая 2026 г.</p>

      <div class="space-y-8 text-[15px] leading-[1.7]">
        <section>
          <p>
            Настоящая Политика описывает, какие данные сервис Writelo (далее — «Сервис», «мы»)
            собирает при использовании сайта и приложения writelo.io, как мы их используем, кому
            передаём и как пользователь может ими управлять. Используя Сервис, вы соглашаетесь с
            условиями этой Политики.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">1. Какие данные мы собираем</h2>
          <p class="mb-3"><strong>Данные регистрации:</strong> имя, email-адрес, пароль (в зашифрованном виде).</p>
          <p class="mb-3"><strong>Данные при подключении соцсетей.</strong> Если вы привязываете аккаунт Instagram, Facebook, Telegram или другой соцсети, мы получаем через официальные API:</p>
          <ul class="list-disc pl-6 space-y-1 mb-3">
            <li>идентификатор и публичную информацию профиля (имя, юзернейм, аватар);</li>
            <li>список бизнес-аккаунтов и страниц, к которым вы предоставили доступ;</li>
            <li>токен доступа, выданный платформой (используется для отправки запросов от вашего имени);</li>
            <li>метаданные публикаций (даты, статусы, метрики охвата) — только если соответствующие разрешения предоставлены вами при авторизации.</li>
          </ul>
          <p class="mb-3"><strong>Контент, который вы создаёте:</strong> тексты постов, загруженные медиафайлы, заметки, расписания публикаций.</p>
          <p><strong>Техническая информация:</strong> IP-адрес, тип браузера, операционная система, страницы, которые вы посещаете, время сессии.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">2. Как мы используем данные</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>предоставление функций Сервиса (планирование, публикация, аналитика);</li>
            <li>публикация подготовленных вами материалов в соцсетях от вашего имени;</li>
            <li>хранение черновиков и истории действий, чтобы вы могли к ним вернуться;</li>
            <li>отправка системных уведомлений (например, об ошибках публикации);</li>
            <li>обеспечение безопасности (анти-фрод, защита от злоупотреблений);</li>
            <li>улучшение качества Сервиса в обезличенной агрегированной форме.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">3. Данные из Instagram и Meta-платформ</h2>
          <p class="mb-3">
            Подключение Instagram Business происходит через Instagram Business Login. Мы используем
            данные, полученные через Instagram Graph API, <strong>исключительно для предоставления
            функций Сервиса вам как владельцу подключённого аккаунта</strong>.
          </p>
          <p class="mb-3">Мы <strong>не</strong> используем данные Instagram для:</p>
          <ul class="list-disc pl-6 space-y-1 mb-3">
            <li>продажи третьим лицам;</li>
            <li>таргетирования рекламы;</li>
            <li>обучения сторонних моделей машинного обучения;</li>
            <li>любых целей, не связанных с выполнением ваших операций в Сервисе.</li>
          </ul>
          <p>
            Использование данных Meta-платформ регулируется
            <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" class="underline">Meta Platform Terms</a>
            и
            <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" class="underline">Developer Policies</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">4. Передача третьим лицам</h2>
          <p class="mb-3">Мы передаём данные ограниченному числу провайдеров, обеспечивающих работу Сервиса:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>облачный хостинг — для размещения серверов и хранения данных;</li>
            <li>почтовый провайдер — для отправки писем (подтверждение, восстановление пароля);</li>
            <li>платёжный провайдер — при оформлении подписки (мы не храним данные карт);</li>
            <li>OAuth-провайдеры (Google, Meta, Telegram, «Яндекс») — для авторизации.</li>
          </ul>
          <p class="mt-3">Мы не продаём данные, не передаём их рекламным сетям и не используем для трекинга вне Сервиса.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">5. Срок хранения</h2>
          <p>
            Мы храним данные, пока существует ваш аккаунт. После удаления аккаунта данные
            удаляются в течение 30 дней. Резервные копии перезаписываются в течение 90 дней.
            Юридически обязательные записи (например, чеки) хранятся согласно требованиям
            применимого законодательства.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">6. Ваши права</h2>
          <p class="mb-3">Вы можете в любой момент:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>отвязать подключённый аккаунт соцсети в настройках бренда;</li>
            <li>отозвать доступ Сервиса в настройках самой соцсети (например, в Meta Business Suite);</li>
            <li>запросить удаление аккаунта и всех связанных данных —
              см. <NuxtLink to="/data-deletion" class="underline">инструкцию по удалению</NuxtLink>;
            </li>
            <li>запросить выгрузку ваших данных, написав на указанный ниже email.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">7. Cookies</h2>
          <p>
            Мы используем cookies и localStorage для сохранения сессии, выбранного языка интерфейса
            и пользовательских настроек. Трекинговые cookies третьих сторон не используются для
            рекламы.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">8. Изменения Политики</h2>
          <p>
            Мы можем обновлять Политику. Об изменениях, существенно затрагивающих обработку данных,
            мы уведомим по email или баннером в приложении. Дата последнего обновления указана в
            начале документа.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">9. Контакты</h2>
          <p>
            По всем вопросам, связанным с обработкой данных, пишите на
            <a href="mailto:hello@writelo.io" class="underline">hello@writelo.io</a>.
          </p>
        </section>
      </div>

      <footer class="mt-16 pt-8 border-t border-[#0a0a0a]/10 dark:border-[#ede8de]/10 flex items-center justify-between text-sm text-[#5f5f5f] dark:text-[#a8a094]">
        <NuxtLink to="/terms" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Условия использования</NuxtLink>
        <NuxtLink to="/data-deletion" class="hover:text-[#0a0a0a] dark:hover:text-[#ede8de] transition-colors">Удаление данных</NuxtLink>
      </footer>
    </main>
  </div>
</template>

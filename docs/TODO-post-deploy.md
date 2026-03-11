# После деплоя writelo.io

## SEO и индексация

- [ ] Купить домен writelo.io
- [ ] Добавить сайт в [Google Search Console](https://search.google.com/search-console)
- [ ] Добавить сайт в [Яндекс.Вебмастер](https://webmaster.yandex.ru)
- [ ] Отправить sitemap.xml на индексацию в обоих сервисах
- [ ] Проверить индексацию через `site:writelo.io` в Google/Яндекс (через 1-2 недели)

## Брендинг

- [ ] Создать Telegram канал @writelo
- [ ] Настроить почту support@writelo.io
- [ ] Заменить og-image.svg на PNG (1200x630) — конвертировать или создать в Figma/Canva
- [ ] **Favicon**: перегенерировать все PNG иконки из favicon.svg (сейчас старые с белым фоном):
  - Использовать [realfavicongenerator.net](https://realfavicongenerator.net) или конвертировать вручную
  - Заменить: favicon.ico, favicon-16x16.png, favicon-32x32.png
  - Заменить: apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png

## Аналитика

- [ ] Подключить Яндекс.Метрику
- [ ] Подключить Google Analytics (опционально)
- [ ] Настроить цели (клик по CTA, регистрация)

## Проверки

- [ ] Проверить prerender: `curl -s https://writelo.io/landing | head -100` (должен быть HTML с контентом)
- [ ] Проверить OG теги: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Проверить в Telegram (отправить ссылку — должна показаться превью)

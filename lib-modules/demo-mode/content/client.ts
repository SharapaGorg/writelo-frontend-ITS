// lib-modules/demo-mode/content/client.ts

export interface DemoClient {
  name: string
  description: string
}

export const demoClient: DemoClient = {
  name: 'Кофейня «Зерно»',
  description:
    'Уютная кофейня в центре города. Specialty кофе, авторские десерты, завтраки весь день. Целевая аудитория: 25-40 лет, ценители качественного кофе.',
}

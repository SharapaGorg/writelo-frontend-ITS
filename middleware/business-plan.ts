import { usePlans } from '~/lib-modules/plans'

export default defineNuxtRouteMiddleware(() => {
  const { isBusinessPlan, loaded } = usePlans()

  // Если конфиг ещё не подгрузился — пропускаем; флаг вычислится после init().
  // Cтраницы сами должны учитывать loaded-state. Альтернатива — ждать, но это
  // блокирует роут; в продакшене settings.init() стоит на app boot, поэтому
  // к моменту навигации loaded === true.
  if (!loaded.value) return

  if (!isBusinessPlan.value) {
    return navigateTo('/app/plans')
  }
})

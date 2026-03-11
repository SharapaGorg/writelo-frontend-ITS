export default defineNuxtRouteMiddleware(async (to) => {
  const userController = useUserController()
  
  // Ждем инициализации контроллера
  await userController.whenReady()
  
  if (!userController.getToken()) {
    return navigateTo('/auth')
  }
})
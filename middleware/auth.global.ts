export default defineNuxtRouteMiddleware(async (to) => {
    const publicRoutes = ['/auth', '/verify-email', '/reset-password']

    if (publicRoutes.includes(to.path)) {
        return
    }

    const userController = useUserController();

    // @ts-ignore
    userController.whenReady().then(() => {
        if (!userController.getToken()) {
            return navigateTo('/auth')
        }
    })
})
export default defineNuxtRouteMiddleware(async (to) => {
    const publicRoutes = ['/', '/landing', '/start', '/auth', '/verify-email', '/reset-password']

    // Allow routes that explicitly disable auth or are in publicRoutes
    if (to.meta.auth === false || publicRoutes.includes(to.path)) {
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
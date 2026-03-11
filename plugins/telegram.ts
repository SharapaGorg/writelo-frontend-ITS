// plugins/telegram.ts
export default defineNuxtPlugin(() => {
    function onWebAppReady(): Promise<void> {
        return new Promise((resolve) => {
            if (window?.Telegram?.WebApp?.initDataUnsafe) {
                resolve();
            } else {
                // Hook to the WebApp 'ready' event
                window.Telegram?.WebApp?.onEvent?.('themeChanged', resolve); // 'themeChanged' fires on init as well
                window.Telegram?.WebApp?.onEvent?.('mainButtonClicked', resolve);
                // or just setTimeout as a fallback for 100ms/200ms,
                setTimeout(resolve, 200); // fallback, rough but works if events aren't working
            }
        });
    }

    return {
        provide: {
            telegram: {
                async getUser() {
                    if (process.client && window.Telegram?.WebApp) {
                        await onWebAppReady();
                        return window.Telegram.WebApp.initDataUnsafe?.user || null;
                    }
                    return null;
                },
                async getInitData() {
                    if (process.client && window.Telegram?.WebApp) {
                        await onWebAppReady();
                        return window.Telegram.WebApp.initData || '';
                    }
                    return '';
                },

                async initConfiguration(): Promise<void> {
                    if (process.client && window.Telegram?.WebApp) {
                        await onWebAppReady();
                        window.Telegram.WebApp.expand();

                        // Note: viewport control is now handled in useTelegramViewportHack composable
                        // using the official Bot API 7.7+ disableVerticalSwipes method
                    }
                },
                async shareConversation(conversation_id: string): Promise<void> {
                    if (process.client && window.Telegram?.WebApp) {
                        await onWebAppReady();
                        await this.sendData({
                            action: "share_conversation",
                            conversation_id: conversation_id
                        })
                    }
                },
                async sendData(data: { [key: string]: string }): Promise<void> {
                    if (process.client && window.Telegram?.WebApp) {
                        await onWebAppReady();
                        window.Telegram.WebApp.sendData(JSON.stringify(data));
                    }
                }
            }
        }
    }
});

let entity: null | UserController = null;

export function useUserController() {
    if (entity) {
        return entity;
    }

    entity = new UserController();
    return entity;
}

class UserController {
    private telegram_id: number | null = 778327202;
    private authToken: Ref<string>;
    private authTokenName = 'neovision-ai-bot-auth-token';

    private readyListeners: Array<() => void> = [];
    private inited = false;
    private readonly readyPromise: Promise<void>;
    private readyResolve!: () => void;

    constructor() {
        const isProduction = process.env.NODE_ENV === 'production';
        this.authToken = useCookie(this.authTokenName, {
            secure: isProduction,
            httpOnly: false,  // Must be false - we set token from frontend JS
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30  // 30 days
        });

        if (!isProduction) {
            // this.authToken.value = ""; // блять что это за хуета?
        }

        this.readyPromise = new Promise(resolve => {
            this.readyResolve = resolve;
        });
    }

    async init() {
        if (this.inited) {
            console.log('[UserController] early exit: already inited');
            return;
        }
        try {
            if (process.env.NODE_ENV === 'production') {
                await this.initTelegramSettings();
                await this.initUserFromTelegram();
            } else {
                await new Promise(resolve => setTimeout(resolve, 1));
                // this.authToken.value = this.telegram_id as any;
                // this.authToken.value = '__DEV__778327202__RADOLYN__';
                // this.authToken.value = '__DEV__139303278__RADOLYN__'
                // this.authToken.value = '__DEV__6118371448__RADOLYN__';
            }
        } catch (e) {
            console.error('[UserController] init error:', e);
        } finally {
            this.inited = true;
            this.notifyReady();
            console.log('[UserController] init (finally done -> notifyReady called)');
        }
    }


    onReady(cb: () => void) {
        if (this.inited) cb();
        else this.readyListeners.push(cb);
    }

    whenReady(): Promise<void> {
        return this.readyPromise;
    }

    private notifyReady() {
        for (const fn of this.readyListeners) {
            fn();
        }
        // fulfill promise for any new .whenReady() calls
        this.readyResolve();
        this.readyListeners = [];
    }

    async initTelegramSettings() {
        if (process.client) {
            const {$telegram} = useNuxtApp();
            await $telegram.initConfiguration();
        }
    }

    async initUserFromTelegram() {
        if (process.client) {
            const {$telegram} = useNuxtApp();

            const user = await $telegram.getUser();
            const initData = await $telegram.getInitData();

            if (initData.length >= 10) {
                this.setAuthToken(initData);
            }

            if (user && user.id) {
                this.telegram_id = user.id;
                // this.setAuthToken(String(user.id));
            }
        }
    }

    setAuthToken(token: string) {
        console.warn('SET AUTH TOKEN');
        this.authToken.value = token;
    }

    getToken() {
        return this.authToken.value;
    }

    clearToken() {
        this.authToken.value = '';
    }

    getTelegramId() {
        return this.telegram_id;
    }
}
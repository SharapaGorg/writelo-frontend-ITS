import { useWorkspaceContext } from '~/lib-modules/workspaces'
import type { UserDto } from '~/scripts/shared/types/workspace'

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
    private authTokenName = 'writelo-auth-token';
    private legacyTokenName = 'neovision-ai-bot-auth-token';

    private readyListeners: Array<() => void> = [];
    private inited = false;
    private readonly readyPromise: Promise<void>;
    private readyResolve!: () => void;

    constructor() {
        const isProduction = (process.env.APP_ENV || process.env.NODE_ENV) === 'production';

        // Clear legacy cookie (force re-login for migration)
        const legacyCookie = useCookie(this.legacyTokenName);
        if (legacyCookie.value) {
            console.log('[UserController] Clearing legacy auth token');
            legacyCookie.value = null;
        }
        this.authToken = useCookie(this.authTokenName, {
            secure: isProduction,
            httpOnly: false,  // Must be false - we set token from frontend JS
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30  // 30 days
        });

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
            if ((process.env.APP_ENV || process.env.NODE_ENV) === 'production') {
                await this.initTelegramSettings();
                await this.initUserFromTelegram();
            } else {
                await new Promise(resolve => setTimeout(resolve, 1));
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
            }
        }
    }

    /**
     * Set auth token and optionally initialize workspace context
     * @param token JWT or Telegram initData
     * @param user Optional user data from auth response
     */
    setAuthToken(token: string, user?: UserDto) {
        console.log('[UserController] Setting auth token');
        this.authToken.value = token;

        // Initialize workspace context if user has primaryWorkspaceId
        if (user?.primaryWorkspaceId) {
            const workspaceContext = useWorkspaceContext();
            workspaceContext.initialize(user.primaryWorkspaceId);
        }
    }

    getToken() {
        return this.authToken.value;
    }

    clearToken() {
        this.authToken.value = '';
        // Clear workspace context on logout
        const workspaceContext = useWorkspaceContext();
        workspaceContext.clear();
    }

    getTelegramId() {
        return this.telegram_id;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.authToken.value;
    }
}
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,

    // Session Replay (можно отключить, если не нужен)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],

    debug: false,
    enableTracing: true,
});

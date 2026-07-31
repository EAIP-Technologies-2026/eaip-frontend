import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
const SENTRY_TRACES_SAMPLE_RATE = parseFloat(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0',
);
const SENTRY_REPLAYS_SESSION_SAMPLE_RATE = parseFloat(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0',
);
const SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = parseFloat(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '0',
);

const isProduction = SENTRY_ENVIRONMENT === 'production';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT ?? 'development',
  release: SENTRY_RELEASE,
  tracesSampleRate: isProduction ? SENTRY_TRACES_SAMPLE_RATE : 0,
  replaysSessionSampleRate: isProduction
    ? SENTRY_REPLAYS_SESSION_SAMPLE_RATE
    : 0,
  replaysOnErrorSampleRate: isProduction
    ? SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
    : 0,
  sendDefaultPii: false,
  attachStacktrace: true,
  enabled: !!SENTRY_DSN,
});

export { Sentry };
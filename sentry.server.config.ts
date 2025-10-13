import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://1551f8917146f730c327de9b39b20c52@o4509488030482432.ingest.us.sentry.io/4509488040312832",
  tracesSampleRate: 0,
  sendDefaultPii: true,
});

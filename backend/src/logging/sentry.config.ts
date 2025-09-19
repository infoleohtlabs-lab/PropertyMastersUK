import * as Sentry from '@sentry/node';
import { httpIntegration, expressIntegration } from '@sentry/node';
import { ConfigService } from '@nestjs/config';

export const initializeSentry = (configService: ConfigService) => {
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  const environment = configService.get<string>('NODE_ENV', 'development');
  const release = configService.get<string>('APP_VERSION', '1.0.0');

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      release,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Filter out sensitive information
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      },
      integrations: [
        httpIntegration(),
        expressIntegration(),
      ],
    });
  }
};

export { Sentry };

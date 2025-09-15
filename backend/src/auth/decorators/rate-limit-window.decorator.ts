import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_WINDOW_KEY = 'rateLimitWindow';
export const RateLimitWindow = (windowMs: number) => SetMetadata(RATE_LIMIT_WINDOW_KEY, windowMs);
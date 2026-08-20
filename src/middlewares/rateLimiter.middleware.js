/**
 * Rate Limiter Middleware
 * Purpose: Provide global, auth, and password reset rate limiting tiers.
 */
import rateLimit from 'express-rate-limit';

import config from '../config/config.js';
import ApiResponse from '../utils/ApiResponse.js';

const createLimiter = ({ windowMs, max, message }) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => ApiResponse.error(res, message, 429),
});

export const rateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.globalMax,
  message: 'Too many requests. Please try again later.',
});

export const authRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: config.rateLimit.authMax,
  message: 'Too many auth attempts. Please try again later.',
});

export const passwordRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: config.rateLimit.passwordMax,
  message: 'Too many password reset attempts. Please try again later.',
});

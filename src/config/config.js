/**
 * Application Config
 * Purpose: Load and validate all environment-backed application settings.
 */
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = [
  'PORT',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
  'CORS_ORIGIN',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`FATAL: Missing required environment variable: ${key}`);
  }
});

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

const config = {
  port: parseInteger(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  mongo: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    refreshTtlSeconds: parseInteger(process.env.JWT_REFRESH_TTL_SECONDS, 7 * 24 * 60 * 60),
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
  cookie: {
    secure: parseBoolean(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
    sameSite: process.env.COOKIE_SAME_SITE || 'strict',
  },
  email: {
    from: process.env.EMAIL_FROM || 'Backend Starter <no-reply@example.com>',
    host: process.env.EMAIL_HOST,
    port: parseInteger(process.env.EMAIL_PORT, 587),
    secure: parseBoolean(process.env.EMAIL_SECURE, false),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    queueEnabled: parseBoolean(process.env.EMAIL_QUEUE_ENABLED, true),
  },
  rateLimit: {
    globalMax: parseInteger(process.env.RATE_LIMIT_GLOBAL_MAX, 200),
    authMax: parseInteger(process.env.RATE_LIMIT_AUTH_MAX, 10),
    passwordMax: parseInteger(process.env.RATE_LIMIT_PASSWORD_MAX, 3),
  },
};

export default config;

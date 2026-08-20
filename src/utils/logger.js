/**
 * Logger Utility
 * Purpose: Provide Winston application logging and Morgan stream integration.
 */
import fs from 'fs';
import path from 'path';
import winston from 'winston';

const logDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const suffix = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${suffix}`;
  }),
);

const logger = winston.createLogger({
  levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: developmentFormat }));
}

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;

/**
 * Redis Config
 * Purpose: Create Redis clients for cache and BullMQ while allowing graceful fallback.
 */
import Redis from 'ioredis';

import config from './config.js';
import logger from '../utils/logger.js';

const redisClient = new Redis(config.redis.url, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
});

redisClient.on('error', (err) => {
  logger.warn('Redis cache connection error; using in-memory fallback where possible.', {
    message: err.message,
  });
});

const connectRedis = async () => {
  if (redisClient.status === 'ready') return redisClient;

  try {
    await redisClient.connect();
    logger.info('Redis connected');
    return redisClient;
  } catch (err) {
    logger.warn('Redis unavailable at startup; cache will use in-memory fallback.', {
      message: err.message,
    });
    return null;
  }
};

const createBullConnection = () => {
  const connection = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  connection.on('error', (err) => {
    logger.warn('BullMQ Redis connection error.', { message: err.message });
  });

  return connection;
};

export {
  redisClient,
  connectRedis,
  createBullConnection,
};

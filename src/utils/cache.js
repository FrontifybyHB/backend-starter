/**
 * Cache Utility
 * Purpose: Provide Redis-first cache operations with in-memory fallback.
 */
import NodeCache from 'node-cache';

import { redisClient } from '../config/redis.js';
import logger from './logger.js';

class CacheUtil {
  constructor(redis, fallback) {
    this.redis = redis;
    this.fallback = fallback;
  }

  isRedisReady() {
    return this.redis && this.redis.status === 'ready';
  }

  async get(key) {
    if (this.isRedisReady()) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (err) {
        logger.warn('Redis cache get failed; reading memory fallback.', { key, message: err.message });
      }
    }

    return this.fallback.get(key) || null;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisReady()) {
      try {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        logger.warn('Redis cache set failed; writing memory fallback.', { key, message: err.message });
      }
    }

    this.fallback.set(key, value, ttlSeconds);
  }

  async del(key) {
    if (this.isRedisReady()) {
      try {
        await this.redis.del(key);
      } catch (err) {
        logger.warn('Redis cache delete failed; deleting memory fallback.', { key, message: err.message });
      }
    }

    this.fallback.del(key);
  }

  async delPattern(prefix) {
    const normalizedPrefix = prefix.endsWith('*') ? prefix.slice(0, -1) : prefix;

    if (this.isRedisReady()) {
      try {
        const stream = this.redis.scanStream({ match: `${normalizedPrefix}*`, count: 100 });
        const pipeline = this.redis.pipeline();
        let count = 0;

        await new Promise((resolve, reject) => {
          stream.on('data', (keys) => {
            keys.forEach((key) => {
              pipeline.del(key);
              count += 1;
            });
          });
          stream.on('end', resolve);
          stream.on('error', reject);
        });

        if (count > 0) await pipeline.exec();
      } catch (err) {
        logger.warn('Redis cache pattern delete failed; deleting memory fallback.', {
          prefix: normalizedPrefix,
          message: err.message,
        });
      }
    }

    this.fallback.keys().forEach((key) => {
      if (key.startsWith(normalizedPrefix)) this.fallback.del(key);
    });
  }
}

const cache = new CacheUtil(redisClient, new NodeCache());

export default cache;

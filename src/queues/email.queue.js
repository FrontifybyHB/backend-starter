/**
 * Email Queue
 * Purpose: Enqueue email delivery jobs for BullMQ-backed background processing.
 */
import { Queue } from 'bullmq';

import config from '../config/config.js';
import { createBullConnection } from '../config/redis.js';
import logger from '../utils/logger.js';

export const emailQueue = new Queue('email', {
  connection: createBullConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
      count: 5000,
    },
  },
});

emailQueue.on('error', (err) => {
  logger.warn('Email queue error.', { message: err.message });
});

export const addEmailJob = async (message) => {
  if (!config.email.queueEnabled) {
    throw new Error('Email queue disabled');
  }

  return emailQueue.add('send-email', message);
};

export const closeEmailQueue = async () => {
  await emailQueue.close();
};

/**
 * Email Worker
 * Purpose: Process BullMQ email jobs in the background.
 */
import { Worker } from 'bullmq';

import config from '../config/config.js';
import { createBullConnection } from '../config/redis.js';
import { deliverEmailNow } from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

export const createEmailWorker = () => {
  if (!config.email.queueEnabled) {
    logger.info('Email worker disabled by EMAIL_QUEUE_ENABLED.');
    return null;
  }

  const worker = new Worker(
    'email',
    async (job) => deliverEmailNow(job.data),
    {
      connection: createBullConnection(),
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    logger.info('Email job completed.', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Email job failed.', {
      jobId: job?.id,
      message: err.message,
    });
  });

  worker.on('error', (err) => {
    logger.warn('Email worker error.', { message: err.message });
  });

  return worker;
};

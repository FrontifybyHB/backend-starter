/**
 * Server Entry
 * Purpose: Connect infrastructure first, then start the HTTP server.
 */
import mongoose from 'mongoose';

import app from './src/app.js';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import { connectRedis, redisClient } from './src/config/redis.js';
import { closeEmailQueue } from './src/queues/email.queue.js';
import logger from './src/utils/logger.js';
import { createEmailWorker } from './src/workers/email.worker.js';

let server;
let emailWorker;

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      if (emailWorker) await emailWorker.close();
      await closeEmailQueue();
      if (redisClient.status !== 'end') redisClient.disconnect();
      await mongoose.connection.close();
      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown.', { message: err.message });
      process.exit(1);
    }
  });
};

const startServer = async () => {
  await connectDB();
  await connectRedis();
  emailWorker = createEmailWorker();

  server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.message);
  process.exit(1);
});

startServer();

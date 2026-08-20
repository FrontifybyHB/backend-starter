/**
 * Database Config
 * Purpose: Connect to MongoDB with startup retry logic.
 */
import mongoose from 'mongoose';

import config from './config.js';
import logger from '../utils/logger.js';

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const connectDB = async (retries = 3) => {
  try {
    await mongoose.connect(config.mongo.uri);
    logger.info('MongoDB connected');
  } catch (err) {
    if (retries > 0) {
      logger.warn(`DB connection failed. Retrying... (${retries} attempts left)`);
      await wait(3000);
      return connectDB(retries - 1);
    }

    logger.error('DB connection failed permanently. Shutting down.', {
      message: err.message,
    });
    process.exit(1);
  }
};

export default connectDB;

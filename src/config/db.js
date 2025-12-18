import mongoose from 'mongoose';
import logger from '../loggers/winston.logger.js'
import config from '../config/config.js'

const connectedToDatabase = () => {
    const dbUrl = config.DB_URL;

    mongoose
        .connect(dbUrl)
        .then(() => {
            logger.info('Connected to MongoDB')
        })
        .catch((err) => {
            logger.error('Error connecting to MongoDB', err)
        })
}

export default connectedToDatabase;
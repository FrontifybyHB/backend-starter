import app from './src/app.js'
import logger from './src/loggers/winston.logger.js'
import config from './src/config/config.js';
import connectedToDatabase from './src/config/db.js';

connectedToDatabase();

app.listen(config.PORT, () => {
    logger.info(`Server is running on port ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV || 'development'}`);
});
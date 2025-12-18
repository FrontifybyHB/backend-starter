import morgan from 'morgan';
import logger from './winston.logger.js';

const format =
    ':remote-addr :method :url :status :res[content-length] - :response-time ms';

const morganLogger = morgan(format, {
    stream: logger.stream,
});

export default morganLogger;

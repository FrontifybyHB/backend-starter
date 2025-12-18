import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import { generalRateLimiter } from './middlewares/rateLimiter.middleware.js'
import morganLogger from './loggers/morgan.logger.js'
import config from './config/config.js'

const app = express();

app.use(
    cors(
        {
            origin: config.FRONTEND_URL,
            credentials: true,
        }
    ));
app.use(morganLogger);
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

app.use(generalRateLimiter)

// import routes
import authRoutes from "./routes/auth.routes.js";
import errorHandler from './middlewares/error.handler.js'

// Auth Routes
app.use('/api/v1/auth', authRoutes)



// // Simple route for checking server status
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the Backend Starter',
        environment: config.NODE_ENV,
        documentation: 'docs.testdog.in',
    });
});

// // 404 route handler for undefined routes
app.all('*name', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    err.status = 'fail';
    next(err);
});

app.use(errorHandler)



export default app;
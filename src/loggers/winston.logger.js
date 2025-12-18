import winston from "winston";
const { createLogger, format, transports } = winston;

/*
|--------------------------------------------------------------------------
| Custom log format
|--------------------------------------------------------------------------
*/
const logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

/*
|--------------------------------------------------------------------------
| Create logger instance
|--------------------------------------------------------------------------
*/
const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "error" : "info",
    format: logFormat,
    transports: [
        // 🔴 Error logs
        new transports.File({
            filename: "logs/error.log",
            level: "error",
        }),

        // 🟢 All logs
        new transports.File({
            filename: "logs/combined.log",
        }),
    ],
});

/*
|--------------------------------------------------------------------------
| Console logs only in development
|--------------------------------------------------------------------------
*/
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: logFormat,
        })
    );
}

/*
|--------------------------------------------------------------------------
| 🔥 REQUIRED FOR MORGAN (IMPORTANT)
|--------------------------------------------------------------------------
| Morgan calls: stream.write(message)
*/
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

export default logger;

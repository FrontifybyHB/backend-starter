/**
 * Factory function to create operational errors
 * CI/CD & ESLint safe version
 */
const appError = (message, statusCode = 500) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    error.isOperational = true;

    Error.captureStackTrace(error, appError);

    return error;
};

export default appError;

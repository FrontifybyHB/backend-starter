/**
 * Factory function to create operational errors
 * Works like AppError class but uses plain functions
 */
const appError = (message, statusCode) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.status =
        statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    error.isOperational = true;

    // Remove this function from stack trace (optional but clean)
    Error.captureStackTrace(error, appError);

    return error;
};

export default appError;

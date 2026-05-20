/**
 * Not Found Middleware
 * Purpose: Forward unmatched routes to the global error handler.
 */
import ApiError from '../utils/ApiError.js';

const notFoundHandler = (req, res, next) => {
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
};

export default notFoundHandler;

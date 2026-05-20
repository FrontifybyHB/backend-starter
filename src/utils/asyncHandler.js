/**
 * Async Handler Utility
 * Purpose: Forward async controller errors to the global error handler.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;

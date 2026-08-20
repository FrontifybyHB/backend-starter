/**
 * Role Middleware
 * Purpose: Authorize requests by allowed user roles.
 */
import ApiError from '../utils/ApiError.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError('Forbidden: insufficient role', 403));
  }

  return next();
};

/**
 * Auth Middleware
 * Purpose: Verify access tokens and attach the authenticated user payload.
 */
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('Access token required', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Access token expired', 401));
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token', 401));
    }

    return next(err);
  }
};

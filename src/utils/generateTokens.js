/**
 * Generate Tokens Utility
 * Purpose: Create access and refresh JWTs for authenticated users.
 */
import jwt from 'jsonwebtoken';

import config from '../config/config.js';

export const generateAccessToken = (payload) => jwt.sign(payload, config.jwt.accessSecret, {
  expiresIn: config.jwt.accessExpiresIn,
});

export const generateRefreshToken = ({ jti, ...payload }) => jwt.sign(payload, config.jwt.refreshSecret, {
  expiresIn: config.jwt.refreshExpiresIn,
  jwtid: jti,
});

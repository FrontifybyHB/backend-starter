/**
 * Auth Routes
 * Purpose: Compose authentication dependencies and wire route middleware.
 */
import express from 'express';

import UserModel from '../models/user.model.js';
import AuthController from '../controllers/auth.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { authRateLimiter, passwordRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import AuthRepository from '../repositories/auth.repository.js';
import AuthService from '../services/auth.service.js';
import cache from '../utils/cache.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  validate,
  verifyEmailSchema,
  verifyEmailTokenSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

const repo = new AuthRepository(UserModel);
const service = new AuthService(repo, cache);
const controller = new AuthController(service);

router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authRateLimiter, controller.refresh);
router.post('/logout', authRateLimiter, controller.logout);
router.get('/me', verifyAccessToken, controller.getMe);
router.post('/forgot-password', passwordRateLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', passwordRateLimiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), controller.sendVerification);
router.post('/verify-email/confirm', authRateLimiter, validate(verifyEmailTokenSchema), controller.verifyEmail);

export default router;

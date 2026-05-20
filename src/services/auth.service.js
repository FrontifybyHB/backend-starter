/**
 * Auth Service
 * Purpose: Implement authentication, token, and password reset business rules.
 */
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/sendEmail.js';

class AuthService {
  constructor(repository, cache) {
    this.repo = repository;
    this.cache = cache;
  }

  sanitizeUser(user) {
    if (!user) return user;
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.__v;
    return safeUser;
  }

  buildTokenPayload(user) {
    return {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };
  }

  async issueTokens(user) {
    const payload = this.buildTokenPayload(user);
    const previousJti = await this.cache.get(`refresh:user:${payload.userId}`);

    if (previousJti) {
      await this.cache.set(`blacklist:${previousJti}`, true, config.jwt.refreshTtlSeconds);
    }

    const jti = crypto.randomUUID();
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ ...payload, jti });

    await Promise.all([
      this.cache.set(`refresh:user:${payload.userId}`, jti, config.jwt.refreshTtlSeconds),
      this.cache.set(`refresh:jti:${jti}`, payload.userId, config.jwt.refreshTtlSeconds),
    ]);

    return { accessToken, refreshToken, refreshTokenId: jti };
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(data) {
    const [emailExists, usernameExists] = await Promise.all([
      this.repo.findByEmail(data.email),
      this.repo.findByUsername(data.username),
    ]);

    if (emailExists) throw new ApiError('Email already registered', 409);
    if (usernameExists) throw new ApiError('Username already taken', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.repo.create({
      username: data.username,
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'user',
    });

    const tokens = await this.issueTokens(user);
    await this.cache.set(`user:${user._id}`, user, 300);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email, password) {
    const user = await this.repo.findByEmailWithPassword(email);

    if (!user || user.status !== 'active') {
      throw new ApiError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password', 401);
    }

    const safeUser = this.sanitizeUser(user);
    const tokens = await this.issueTokens(safeUser);
    await this.cache.set(`user:${safeUser._id}`, safeUser, 300);

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw new ApiError('Refresh token is required', 401);

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const [isBlacklisted, storedUserId, activeJti] = await Promise.all([
        this.cache.get(`blacklist:${decoded.jti}`),
        this.cache.get(`refresh:jti:${decoded.jti}`),
        this.cache.get(`refresh:user:${decoded.userId}`),
      ]);

      if (isBlacklisted || storedUserId !== decoded.userId || activeJti !== decoded.jti) {
        throw new ApiError('Invalid or expired refresh token', 401);
      }

      const accessToken = generateAccessToken({
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      });

      return { accessToken };
    } catch (err) {
      if (err.isOperational) throw err;
      throw new ApiError('Invalid or expired refresh token', 401);
    }
  }

  async logout(refreshToken) {
    if (!refreshToken) return true;

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      await Promise.all([
        this.cache.set(`blacklist:${decoded.jti}`, true, config.jwt.refreshTtlSeconds),
        this.cache.del(`refresh:jti:${decoded.jti}`),
        this.cache.del(`refresh:user:${decoded.userId}`),
      ]);
    } catch {
      return true;
    }

    return true;
  }

  async getMe(userId) {
    const cacheKey = `user:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const user = await this.repo.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    await this.cache.set(cacheKey, user, 300);
    return user;
  }

  async forgotPassword(email) {
    const user = await this.repo.findByEmail(email);

    if (!user) {
      return { queued: true };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    await this.cache.set(`password-reset:${tokenHash}`, { userId: user._id }, 600);
    await sendPasswordResetEmail(user.email, token, user.name);

    return { queued: true };
  }

  async resetPassword(token, password) {
    const tokenHash = this.hashToken(token);
    const cacheKey = `password-reset:${tokenHash}`;
    const resetPayload = await this.cache.get(cacheKey);

    if (!resetPayload) throw new ApiError('Invalid or expired reset token', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.repo.updatePassword(resetPayload.userId, passwordHash);

    await Promise.all([
      this.cache.del(cacheKey),
      this.cache.del(`user:${resetPayload.userId}`),
      this.cache.del(`refresh:user:${resetPayload.userId}`),
    ]);

    return user;
  }

  async sendVerification(email) {
    const user = await this.repo.findByEmail(email);
    if (!user) return { queued: true };

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    await this.cache.set(`email-verify:${tokenHash}`, { userId: user._id }, 600);
    await sendVerificationEmail(user.email, token, user.name);

    return { queued: true };
  }

  async verifyEmail(token) {
    const tokenHash = this.hashToken(token);
    const cacheKey = `email-verify:${tokenHash}`;
    const payload = await this.cache.get(cacheKey);

    if (!payload) throw new ApiError('Invalid or expired verification token', 400);

    const user = await this.repo.markEmailVerified(payload.userId);

    await Promise.all([
      this.cache.del(cacheKey),
      this.cache.del(`user:${payload.userId}`),
    ]);

    return user;
  }
}

export default AuthService;

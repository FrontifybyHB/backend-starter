import jwt from "jsonwebtoken";

import userDAO from "../dao/user.dao.js";
import appError from '../utils/appError.js';
import config from "../config/config.js";
import {hashPassword, comparePassword} from '../utils/password.js'
import * as CONSTANT from "../constants/constants.js";
import logger from "../loggers/winston.logger.js";

/**
 * User Service
 * ------------
 * Business logic only
 * Function-based
 * Beginner + Production ready
 */

const userService = {
    /**
     * Register new user
     */
    async register(userData) {
        const emailExists = await userDAO.findByEmail(userData.email);
        if (emailExists) {
            throw appError("Email already registered", 400);
        }

        const usernameExists = await userDAO.findByUsername(userData.username);
        if (usernameExists) {
            throw appError("Username already taken", 400);
        }

        const hashedPassword = await hashPassword(userData.password);

        const user = await userDAO.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            name: userData.name || "",
            role: userData.role || "user"
        });

        user.password = undefined;
        return user;
    },

    /**
     * Login user
     */
    async login(email, password) {
        const user = await userDAO.findByEmail(email);

        if (!user) {
            throw appError("Invalid email or password", 401);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw appError("Invalid email or password", 401);
        }


        user.password = undefined;
        return user;
    },

    /**
     * Get logged-in user
     */
    async getMe(userId) {
        return userDAO.findById(userId);
    },

    /**
     * Generate access token
     */
    generateAccessToken({ userId, username, email }) {
        return jwt.sign(
            { id: userId, username, email },
            config.JWT_SECRET,
            { expiresIn: CONSTANT.ACCESS_TOKEN_EXPIRATION }
        );
    },

    /**
     * Generate refresh token (stateless)
     */
    generateRefreshToken({ userId }) {
        return jwt.sign(
            { id: userId },
            config.JWT_SECRET,
            { expiresIn: CONSTANT.REFRESH_TOKEN_EXPIRATION }
        );
    },

    /**
     * Verify refresh token (stateless)
     */
    verifyRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
            return decoded;
        } catch (error) {
            logger.warn("Refresh token verification failed", {
                error: error.message,
            });
            throw appError("Invalid or expired refresh token", 401);
        }
    },

    /**
     * Reset password
     */
    async resetPassword(userId, newPassword) {
        const user = await userDAO.findById(userId);
        if (!user) throw appError("User not found", 404);

        user.password = newPassword;
        await user.save(); // triggers hashing
        return true;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        if (updates.password) {
            throw appError("Password update not allowed here", 400);
        }

        return userDAO.updateById(userId, updates);
    },

    /**
     * Generate email verification token
     */
    async generateVerificationToken(email) {
        const user = await userDAO.findByEmail(email);
        if (!user) throw appError("User not found", 404);

        const token = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: CONSTANT.VERIFICATION_TOKEN_EXPIRATION }
        );

        user.emailVerificationToken = token;
        await user.save();

        return token;
    },

    /**
     * Verify email
     */
    async verifyEmail(token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await userDAO.findById(decoded.id);

            if (!user || user.emailVerificationToken !== token) {
                throw appError("Invalid verification token", 401);
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            await user.save();

            return user;
        } catch (error) {
            logger.warn("Email verification failed", {
                error: error.message,
            });
            throw appError("Invalid or expired verification token", 401);
        }
    },
};

export default Object.freeze(userService);

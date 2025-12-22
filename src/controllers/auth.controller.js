import asyncHandler from "../utils/asyncHandler.js";
import config from "../config/config.js";
import userService from "../services/userServices.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import appError from '../utils/appError.js';




const authController = {
    /**
     * Register user
     */
    register: asyncHandler(async (req, res) => {
        const user = await userService.register(req.body);

        const accessToken = userService.generateAccessToken({
            userId: user._id,
            username: user.username,
            email: user.email,
        });

        const refreshToken = userService.generateRefreshToken({
            userId: user._id,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none',
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none',
        });

        res.status(201).json({
            success: true,
            data: user,
            accessToken,
            refreshToken,
        });
    }),

    /**
     * Login user
     */
    login: asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(appError("Email and password are required", 400));
        }

        const user = await userService.login(email, password);

        const accessToken = userService.generateAccessToken({
            userId: user._id,
            username: user.username,
            email: user.email,
        });

        const refreshToken = userService.generateRefreshToken({
            userId: user._id,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none',
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none',
        });

        res.status(200).json({
            success: true,
            data: user,
            accessToken,
            refreshToken,
        });
    }),

    /**
     * Get current user
     */
    getMe: asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return next(appError("Unauthorized", 401));
        }

        const user = await userService.getMe(req.user._id);

        if (!user) {
            return next(appError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    }),

    /**
     * Refresh access token
     */
    refreshAccessToken: asyncHandler(async (req, res, next) => {
        
        let refreshToken;

        if (req.cookies.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        } else if (req.body.refreshToken) {
            refreshToken = req.body.refreshToken;
        } else {
            return next(appError("Refresh token is required", 401));
        }

        if (!refreshToken) {
            return next(appError("Refresh token is required", 401));
        }

        const decoded = userService.verifyRefreshToken(refreshToken);

        const accessToken = userService.generateAccessToken({
            userId: decoded.id,
        });

        res.status(200).json({
            success: true,
            accessToken,
        });
    }),

    /**
     * Logout (stateless)
     */
    logout: asyncHandler(async (req, res) => {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }),

    /**
     * Send verification email
     */
    verifyEmail: asyncHandler(async (req, res, next) => {
        const { email } = req.body;

        if (!email) {
            return next(appError("Email is required", 400));
        }

        const token = await userService.generateVerificationToken(email);

        const verifyUrl = `${config.NODE_ENV === "production"
            ? `${config.WEB_URL}`
            : "http://localhost:3000"
            }/verify-email?token=${token}`;

        await sendVerificationEmail(email, verifyUrl);

        res.status(200).json({
            success: true,
            message: "Verification email sent",
        });
    }),

    /**
     * Verify email token
     */
    verifyEmailToken: asyncHandler(async (req, res, next) => {
        const { token } = req.query;

        if (!token) {
            return next(appError("Token is required", 400));
        }

        const user = await userService.verifyEmail(token);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user,
        });
    }),
};

export default Object.freeze(authController);

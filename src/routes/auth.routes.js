import express from "express";

import authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authRateLimiter} from '../middlewares/rateLimiter.middleware.js'
import { validate } from "../middlewares/validator.middleware.js";
import { 
    registerValidator, 
    loginValidator, 
    verifyEmailValidator, 
    verifyEmailTokenValidator 
} from '../validators/auth.validator.js'


const router = express.Router();

router.use(authRateLimiter)

// Register user
router.post(
    "/register",
    validate(registerValidator),
    authController.register
);

// Login user
router.post(
    "/login",
    validate(loginValidator),
    authController.login
);

// Logout user (stateless)
router.post(
    "/logout",
    protect,
    authController.logout
);

// Get current user
router.get(
    "/get-me",
    protect,
    authController.getMe
);

// Generate new access token
router.post(
    "/refresh-token",
    authController.refreshAccessToken
);


// Send verification email
router.post(
    "/verify-email",
    validate(verifyEmailValidator),
    authController.verifyEmail
);

// Verify email using token
router.get(
    "/verify-email",
    validate(verifyEmailTokenValidator),
    authController.verifyEmailToken
);

export default router;

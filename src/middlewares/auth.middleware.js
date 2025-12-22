import jwt from "jsonwebtoken";
import appError from '../utils/appError.js';
import config from "../config/config.js";
import User from "../models/user.model.js";

/**
 * Protect middleware
 * Checks if user is authenticated using JWT
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Get token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer") ||
            req.cookies.accessToken
        ) {
            token = req.cookies.accessToken || req.headers.authorization.split(" ")[1];
        }



        // 2️⃣ If token not found
        if (!token) {
            return next(
                appError("You are not logged in. Please log in to continue.", 401)
            );
        }

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // decoded = { id, iat, exp }

        // 4️⃣ Check if user still exists
        const user = await User.findById(decoded.id).select("role");

        if (!user) {
            return next(
                appError("The user belonging to this token no longer exists.", 401)
            );
        }

        // 5️⃣ Attach user to request
        req.user = user;

        next();
    } catch (error) {
        // 6️⃣ Token errors handling
        if (error.name === "JsonWebTokenError") {
            return next(appError("Invalid token. Please log in again.", 401));
        }

        if (error.name === "TokenExpiredError") {
            return next(
                appError("Your session has expired. Please log in again.", 401)
            );
        }

        next(error);
    }
};

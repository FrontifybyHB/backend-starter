import nodemailer from "nodemailer";
import config from "./config.js";

/**
 * Create Nodemailer transporter
 * -----------------------------
 * Uses simple SMTP (no Google OAuth)
 */
export const createTransporter = () => {
    return nodemailer.createTransport({
        host: config.EMAIL_HOST,        // e.g. smtp.gmail.com
        port: config.EMAIL_PORT,        // 587
        secure: false,                  // true for 465, false for 587
        auth: {
            user: config.EMAIL_USER,      // your email
            pass: config.EMAIL_PASSWORD,  // app password
        },
    });
};

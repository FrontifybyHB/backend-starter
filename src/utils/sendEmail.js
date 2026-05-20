/**
 * Send Email Utility
 * Purpose: Queue application emails through BullMQ with a direct SMTP fallback.
 */
import nodemailer from 'nodemailer';

import config from '../config/config.js';
import logger from './logger.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user && config.email.password
        ? {
          user: config.email.user,
          pass: config.email.password,
        }
        : undefined,
    });
  }

  return transporter;
};

export const deliverEmailNow = async ({ to, subject, html, text }) => {
  if (!config.email.host) {
    logger.warn('Email delivery skipped because EMAIL_HOST is not configured.', { to, subject });
    return { skipped: true };
  }

  return getTransporter().sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text,
  });
};

export const sendEmail = async (message, options = {}) => {
  const shouldQueue = options.queue !== false && config.email.queueEnabled;

  if (shouldQueue) {
    try {
      const { addEmailJob } = await import('../queues/email.queue.js');
      return addEmailJob(message);
    } catch (err) {
      logger.warn('Email queue unavailable; sending email directly.', {
        message: err.message,
        to: message.to,
      });
    }
  }

  return deliverEmailNow(message);
};

export const sendVerificationEmail = (to, token, name = 'there') => {
  const verificationUrl = `${config.webUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: 'Verify your email',
    html: `
      <p>Hi ${name},</p>
      <p>Please verify your email address using the link below. This link expires in 10 minutes.</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    `,
    text: `Verify your email: ${verificationUrl}`,
  });
};

export const sendPasswordResetEmail = (to, token, name = 'there') => {
  const resetUrl = `${config.webUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: 'Reset your password',
    html: `
      <p>Hi ${name},</p>
      <p>Use the link below to reset your password. This link expires in 10 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
};

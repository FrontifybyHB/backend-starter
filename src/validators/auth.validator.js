/**
 * Auth Validator
 * Purpose: Validate and sanitize authentication request input with Joi.
 */
import Joi from 'joi';

import ApiResponse from '../utils/ApiResponse.js';

const joiOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const strongPassword = Joi.string()
  .trim()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 128 characters',
    'string.pattern.name': 'Password must include at least one {#name}',
    'any.required': 'Password is required',
  });

export const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[A-Za-z0-9_]+$/)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
      'string.pattern.base': 'Username can only include letters, numbers, and underscores',
      'any.required': 'Username is required',
    }),
  name: Joi.string().trim().min(2).max(80).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 80 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    'string.email': 'Email must be valid',
    'string.max': 'Email must be at most 254 characters',
    'any.required': 'Email is required',
  }),
  password: strongPassword,
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    'string.email': 'Email must be valid',
    'string.max': 'Email must be at most 254 characters',
    'any.required': 'Email is required',
  }),
  password: Joi.string().trim().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 128 characters',
    'any.required': 'Password is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    'string.email': 'Email must be valid',
    'string.max': 'Email must be at most 254 characters',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().min(32).max(256).required().messages({
    'string.min': 'Token is required',
    'string.max': 'Token must be at most 256 characters',
    'any.required': 'Token is required',
  }),
  password: strongPassword,
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    'string.email': 'Email must be valid',
    'string.max': 'Email must be at most 254 characters',
    'any.required': 'Email is required',
  }),
});

export const verifyEmailTokenSchema = Joi.object({
  token: Joi.string().trim().min(32).max(256).required().messages({
    'string.min': 'Token is required',
    'string.max': 'Token must be at most 256 characters',
    'any.required': 'Token is required',
  }),
});

export const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], joiOptions);

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replaceAll('"', ''),
    }));
    const message = errors.map((detail) => detail.message).join(', ');
    return ApiResponse.error(res, message, 400, errors);
  }

  req[source] = value;
  return next();
};

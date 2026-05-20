/**
 * Auth Controller
 * Purpose: Translate authentication HTTP requests into service calls and API responses.
 */
import config from '../config/config.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

class AuthController {
  constructor(service) {
    this.service = service;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
    this.getMe = this.getMe.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.sendVerification = this.sendVerification.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
  }

  setRefreshCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: config.jwt.refreshTtlSeconds * 1000,
    });
  }

  clearRefreshCookie(res) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
    });
  }

  register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await this.service.register(req.body);
    this.setRefreshCookie(res, refreshToken);
    return ApiResponse.success(res, { user, accessToken }, 'User registered', 201);
  });

  login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await this.service.login(req.body.email, req.body.password);
    this.setRefreshCookie(res, refreshToken);
    return ApiResponse.success(res, { user, accessToken }, 'Logged in');
  });

  refresh = asyncHandler(async (req, res) => {
    const data = await this.service.refresh(req.cookies.refreshToken);
    return ApiResponse.success(res, data, 'Access token refreshed');
  });

  logout = asyncHandler(async (req, res) => {
    await this.service.logout(req.cookies.refreshToken);
    this.clearRefreshCookie(res);
    return ApiResponse.success(res, null, 'Logged out');
  });

  getMe = asyncHandler(async (req, res) => {
    const user = await this.service.getMe(req.user.userId);
    return ApiResponse.success(res, user, 'Profile fetched');
  });

  forgotPassword = asyncHandler(async (req, res) => {
    await this.service.forgotPassword(req.body.email);
    return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.');
  });

  resetPassword = asyncHandler(async (req, res) => {
    await this.service.resetPassword(req.body.token, req.body.password);
    return ApiResponse.success(res, null, 'Password reset successfully');
  });

  sendVerification = asyncHandler(async (req, res) => {
    await this.service.sendVerification(req.body.email);
    return ApiResponse.success(res, null, 'If that email exists, a verification link has been sent.');
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const user = await this.service.verifyEmail(req.body.token);
    return ApiResponse.success(res, user, 'Email verified successfully');
  });
}

export default AuthController;

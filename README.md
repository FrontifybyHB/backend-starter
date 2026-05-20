# Backend Starter HB v2

Production-grade Node.js + Express backend scaffold with class-based feature layers, MongoDB, JWT auth, Redis cache fallback, BullMQ email jobs, Winston logging, Joi validation, and Jest tests.

## Stack

- Node.js 20 LTS
- Express 4
- MongoDB + Mongoose 8
- JWT access + refresh token auth
- Redis via `ioredis` with `node-cache` fallback
- BullMQ for background email jobs
- Joi validation
- Winston + Morgan logging
- Jest + Supertest

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` before starting the server. The v2 scaffold expects `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, and `CORS_ORIGIN`.

## Folder Structure

```text
src/
├── config/
│   ├── config.js
│   ├── db.js
│   └── redis.js
├── contracts/
│   └── auth.contract.js
├── controllers/
│   └── auth.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   ├── rateLimiter.middleware.js
│   └── role.middleware.js
├── models/
│   └── user.model.js
├── queues/
│   └── email.queue.js
├── repositories/
│   └── auth.repository.js
├── routes/
│   ├── auth.routes.js
│   └── index.js
├── services/
│   └── auth.service.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── cache.js
│   ├── generateTokens.js
│   ├── logger.js
│   └── sendEmail.js
├── validators/
│   └── auth.validator.js
├── workers/
│   └── email.worker.js
└── app.js
```

## Auth Routes

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
POST /api/v1/auth/verify-email/confirm
```

Refresh tokens are stored in an `httpOnly` cookie. Access tokens are returned in the response body and should be sent as `Authorization: Bearer <token>` for protected routes.

## Scripts

```bash
npm run dev
npm start
npm run lint
npm test
```

## BullMQ Email Flow

`sendEmail` queues messages through BullMQ when `EMAIL_QUEUE_ENABLED=true`. The worker is started from `server.js` after Mongo and Redis startup. If the queue is disabled or unavailable, email delivery falls back to direct SMTP so local development does not hard-fail.

/**
 * Routes Index
 * Purpose: Aggregate all feature route modules under the API version.
 */
import express from 'express';

import authRoutes from './auth.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);

export default router;

import rateLimit from 'express-rate-limit';

const rateLimitMessage = {
  success: false,
  error: {
    code: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.',
  },
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

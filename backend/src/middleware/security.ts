import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

export const setupSecurity = (app: Express): void => {
  // 1. HTTP security headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // 2. CORS — only allow the configured frontend origin
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(
    cors({
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: false,
    }),
  );

  // 3. Rate limiting — cap API abuse per IP
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '20', 10);

  const limiter = rateLimit({
    windowMs,
    max: maxRequests,
    message: { success: false, error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);
};

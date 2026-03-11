import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { setupSecurity } from './middleware/security';
import { uploadRouter } from './routes/upload';
import { setupSwagger } from './swagger';

// Load .env from project root (../../ from src/ or dist/) with fallback to local .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback for when .env is placed directly in backend/

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

// Trust first proxy (Render, Railway, Heroku, etc.) so express-rate-limit
// correctly reads client IPs from X-Forwarded-For
app.set('trust proxy', 1);

// Body parsing (JSON/urlencoded for non-file routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware (helmet, cors, rate-limit)
setupSecurity(app);

// Swagger docs
setupSwagger(app);

// Routes
app.use('/api', uploadRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

export default app;

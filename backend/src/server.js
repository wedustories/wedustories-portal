import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/posts.routes.js';
import feedRoutes from './routes/feed.routes.js';
import eventRoutes from './routes/events.routes.js';
import teamRoutes from './routes/team.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error.js';
import { startSchedulers } from './services/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../', env.uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));
app.use(errorHandler);

await connectDB();
app.listen(env.port, () => {
  console.log(`🚀 Backend on ${env.port}`);
  startSchedulers();
});

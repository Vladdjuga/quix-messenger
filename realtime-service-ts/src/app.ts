import express, { type Request, type Response } from 'express';
import {authMiddleware} from "./middleware/authMiddleware.js";
import {loggingMiddleware} from "./middleware/loggingMiddleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Protect all API routes with authentication middleware
app.use('/api', authMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real-time Service TS is running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/health`);
});


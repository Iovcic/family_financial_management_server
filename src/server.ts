import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { testConnection } from './config/database.js';
import { BudgetRouter } from './budjet/budjet.routes.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Budget App API is running!' });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/budgets', BudgetRouter);

// Pornește serverul
const startServer = async () => {
  try {
    // Testează conexiunea la DB
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
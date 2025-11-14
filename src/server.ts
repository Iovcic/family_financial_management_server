import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { BudgetRouter } from './budget/budjet.routes.js';
import { CategoryRouter } from './category/category.routes.js';
import { CategoryBudgetRouter } from './category_budget/categoryBudget.routes.js';
import { testConnection } from './config/database.js';
import { AuthRouter, LoggedRouter } from './authentication/auth.routes.js'
import cookieParser from 'cookie-parser';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Budget App API is running!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/budgets', BudgetRouter);
app.use('/api/categories', CategoryRouter);
app.use('/api/category-budgets', CategoryBudgetRouter);
app.use('/api', AuthRouter);
app.use('/api', LoggedRouter);

const startServer = async () => {
  try {
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
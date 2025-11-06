import { Router } from 'express';
import BudgetController from './budget.controller.js';

export const BudgetRouter = Router();

// POST /api/budgets - Crează un buget nou
BudgetRouter.post('/', BudgetController.create);

// GET /api/budgets/:id - Obține un buget după ID
BudgetRouter.get('/:id', BudgetController.getById);

// GET /api/budgets/user/:userId - Obține toate bugetele unui user
BudgetRouter.get('/user/:userId', BudgetController.getAllByUser);

// GET /api/budgets/user/:userId/:year/:month - Obține buget specific
BudgetRouter.get('/user/:userId/:year/:month', BudgetController.getByUserAndDate);

// PUT /api/budgets/:id - Actualizează un buget
BudgetRouter.put('/:id', BudgetController.update);

// DELETE /api/budgets/:id - Șterge un buget
BudgetRouter.delete('/:id', BudgetController.delete);
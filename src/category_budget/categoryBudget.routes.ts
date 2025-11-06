import { Router } from 'express';
import categoryBudgetController from './categoryBudget.controller.js';

export const CategoryBudgetRouter = Router();

CategoryBudgetRouter.post('/', categoryBudgetController.create);
CategoryBudgetRouter.get('/budget/:budgetId', categoryBudgetController.getAllByBudget);
CategoryBudgetRouter.put('/:id', categoryBudgetController.update);
CategoryBudgetRouter.delete('/:id', categoryBudgetController.delete);
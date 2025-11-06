import { Request, Response } from 'express';
import categoryBudgetModel, { CreateCategoryBudgetDTO, UpdateCategoryBudgetDTO } from './categoryBudget.model.js';
import budgetModel from '../budget/budget.model.js';
import categoryModel from '../category/category.model.js';

class CategoryBudgetController {
    // POST /api/category-budgets - Crează un category budget
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { budget_id, category_id, amount, description }: CreateCategoryBudgetDTO = req.body;

            if (!budget_id || !category_id || amount === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: budget_id, category_id, amount'
                });
                return;
            }

            if (amount < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be positive'
                });
                return;
            }

            // Verifică dacă bugetul există
            const budget = await budgetModel.findById(budget_id);
            if (!budget) {
                res.status(404).json({
                    success: false,
                    message: 'Budget not found'
                });
                return;
            }

            // Verifică dacă categoria există
            const category = await categoryModel.findById(category_id);
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
                return;
            }

            // Verifică dacă categoria deja există în acest buget
            const existing = await categoryBudgetModel.findByBudgetAndCategory(budget_id, category_id);
            if (existing) {
                res.status(409).json({
                    success: false,
                    message: 'Category already added to this budget'
                });
                return;
            }

            const categoryBudget = await categoryBudgetModel.create({
                budget_id,
                category_id,
                amount,
                description
            });

            res.status(201).json({
                success: true,
                message: 'Category budget created successfully',
                data: categoryBudget
            });
        } catch (error) {
            console.error('Error creating category budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // GET /api/category-budgets/budget/:budgetId - Obține toate category budgets pentru un buget
    async getAllByBudget(req: Request, res: Response): Promise<void> {
        try {
            const budgetId = parseInt(req.params.budgetId);

            if (isNaN(budgetId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid budget ID'
                });
                return;
            }

            const categoryBudgets = await categoryBudgetModel.findAllByBudget(budgetId);

            res.status(200).json({
                success: true,
                data: categoryBudgets
            });
        } catch (error) {
            console.error('Error fetching category budgets:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // PUT /api/category-budgets/:id - Actualizează un category budget
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { amount, remaining_amount, description }: UpdateCategoryBudgetDTO = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid category budget ID'
                });
                return;
            }

            if (amount !== undefined && amount < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be positive'
                });
                return;
            }

            if (remaining_amount !== undefined && remaining_amount < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Remaining amount must be positive'
                });
                return;
            }

            const existing = await categoryBudgetModel.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Category budget not found'
                });
                return;
            }

            const updated = await categoryBudgetModel.update(id, {
                amount,
                remaining_amount,
                description
            });

            res.status(200).json({
                success: true,
                message: 'Category budget updated successfully',
                data: updated
            });
        } catch (error) {
            console.error('Error updating category budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // DELETE /api/category-budgets/:id - Șterge un category budget
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid category budget ID'
                });
                return;
            }

            const existing = await categoryBudgetModel.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Category budget not found'
                });
                return;
            }

            await categoryBudgetModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Category budget deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting category budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default new CategoryBudgetController();
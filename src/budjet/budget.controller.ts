import { Request, Response } from 'express';
import { ICreateBudgetDTO, IUpdateBudgetDTO } from './types.js';
import BudgetModel from './budget.model.js';

class BudgetController {
    // POST /api/budgets - Crează un buget nou
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, month, year, total_budget }: ICreateBudgetDTO = req.body;

            // Validare
            if (!user_id || !month || !year || total_budget === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: user_id, month, year, total_budget'
                });
                return;
            }

            if (month < 1 || month > 12) {
                res.status(400).json({
                    success: false,
                    message: 'Month must be between 1 and 12'
                });
                return;
            }

            if (year < 2000) {
                res.status(400).json({
                    success: false,
                    message: 'Year must be 2000 or later'
                });
                return;
            }

            if (total_budget < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Total budget must be positive'
                });
                return;
            }

            // Verifică dacă bugetul deja există pentru această lună
            const existing = await BudgetModel.findByUserAndDate(user_id, month, year);
            if (existing) {
                res.status(409).json({
                    success: false,
                    message: `Budget already exists for ${month}/${year}`
                });
                return;
            }

            // Crează bugetul
            const budget = await BudgetModel.create({ user_id, month, year, total_budget });

            res.status(201).json({
                success: true,
                message: 'Budget created successfully',
                data: budget
            });
        } catch (error) {
            console.error('Error creating budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // GET /api/budgets/:id - Obține un buget după ID
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid budget ID'
                });
                return;
            }

            const budget = await BudgetModel.findById(id);

            if (!budget) {
                res.status(404).json({
                    success: false,
                    message: 'Budget not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: budget
            });
        } catch (error) {
            console.error('Error fetching budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // GET /api/budgets/user/:userId - Obține toate bugetele unui user
    async getAllByUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
                return;
            }

            const budgets = await BudgetModel.findAllByUser(userId);

            res.status(200).json({
                success: true,
                data: budgets
            });
        } catch (error) {
            console.error('Error fetching budgets:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // GET /api/budgets/user/:userId/:year/:month - Obține buget specific
    async getByUserAndDate(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);
            const month = parseInt(req.params.month);
            const year = parseInt(req.params.year);

            if (isNaN(userId) || isNaN(month) || isNaN(year)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid parameters'
                });
                return;
            }

            const budget = await BudgetModel.findByUserAndDate(userId, month, year);

            if (!budget) {
                res.status(404).json({
                    success: false,
                    message: 'Budget not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: budget
            });
        } catch (error) {
            console.error('Error fetching budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // PUT /api/budgets/:id - Actualizează un buget
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { total_budget }: IUpdateBudgetDTO = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid budget ID'
                });
                return;
            }

            if (total_budget === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'Missing total_budget field'
                });
                return;
            }

            if (total_budget < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Total budget must be positive'
                });
                return;
            }

            // Verifică dacă bugetul există
            const existing = await BudgetModel.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Budget not found'
                });
                return;
            }

            const updatedBudget = await BudgetModel.update(id, { total_budget });

            res.status(200).json({
                success: true,
                message: 'Budget updated successfully',
                data: updatedBudget
            });
        } catch (error) {
            console.error('Error updating budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // DELETE /api/budgets/:id - Șterge un buget
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid budget ID'
                });
                return;
            }

            // Verifică dacă bugetul există
            const existing = await BudgetModel.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Budget not found'
                });
                return;
            }

            const deleted = await BudgetModel.delete(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Budget deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete budget'
                });
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default new BudgetController();
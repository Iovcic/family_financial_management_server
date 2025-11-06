
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';

export interface Budget {
    id: number;
    user_id: number;
    month: number;
    year: number;
    total_budget: number;
    created_at: Date;
    updated_at: Date;
}

export interface CategoryBudgetDetail {
    id: number;
    category_id: number;
    category_name: string;
    amount: number;
    remaining_amount: number;
    description: string | null;
}

export interface BudgetWithCategories extends Budget {
    category_budgets: CategoryBudgetDetail[];
    total_allocated: number;
}

export interface CreateBudgetDTO {
    user_id: number;
    month: number;
    year: number;
    total_budget: number;
}

export interface UpdateBudgetDTO {
    total_budget?: number;
}

class BudgetModel {
    // Crează un buget nou
    async create(data: CreateBudgetDTO): Promise<Budget | null> {
        const { user_id, month, year, total_budget } = data;

        const query = `
      INSERT INTO budgets (user_id, month, year, total_budget)
      VALUES (?, ?, ?, ?)
    `;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                query,
                [user_id, month, year, total_budget]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Găsește buget după ID
    async findById(id: number): Promise<Budget | null> {
        const query = 'SELECT * FROM budgets WHERE id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Budget;
    }

    // Găsește buget după ID cu category_budgets
    async findByIdWithCategories(id: number): Promise<BudgetWithCategories | null> {
        const budget = await this.findById(id);

        if (!budget) {
            return null;
        }

        const categoryBudgets = await this.getCategoryBudgets(id);
        const totalAllocated = categoryBudgets.reduce((sum, cb) => sum + Number(cb.amount), 0);

        return {
            ...budget,
            category_budgets: categoryBudgets,
            total_allocated: totalAllocated
        };
    }

    // Găsește buget după user_id, month și year
    async findByUserAndDate(user_id: number, month: number, year: number): Promise<Budget | null> {
        const query = 'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(
            query,
            [user_id, month, year]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Budget;
    }

    // Găsește buget după user_id, month și year cu category_budgets
    async findByUserAndDateWithCategories(
        user_id: number,
        month: number,
        year: number
    ): Promise<BudgetWithCategories | null> {
        const budget = await this.findByUserAndDate(user_id, month, year);

        if (!budget) {
            return null;
        }

        const categoryBudgets = await this.getCategoryBudgets(budget.id);
        const totalAllocated = categoryBudgets.reduce((sum, cb) => sum + Number(cb.amount), 0);

        return {
            ...budget,
            category_budgets: categoryBudgets,
            total_allocated: totalAllocated
        };
    }

    // Găsește toate bugetele unui user cu category_budgets
    async findAllByUserWithCategories(user_id: number): Promise<BudgetWithCategories[]> {
        const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY year DESC, month DESC
    `;

        const [budgets] = await pool.execute<RowDataPacket[]>(query, [user_id]);

        // Pentru fiecare buget, obține category_budgets
        const budgetsWithCategories: BudgetWithCategories[] = [];

        for (const budget of budgets) {
            const categoryBudgets = await this.getCategoryBudgets(budget.id);
            const totalAllocated = categoryBudgets.reduce((sum, cb) => sum + Number(cb.amount), 0);

            budgetsWithCategories.push({
                ...budget as Budget,
                category_budgets: categoryBudgets,
                total_allocated: totalAllocated
            });
        }

        return budgetsWithCategories;
    }

    // Metodă helper pentru a obține category_budgets
    private async getCategoryBudgets(budget_id: number): Promise<CategoryBudgetDetail[]> {
        const query = `
      SELECT 
        cb.id,
        cb.category_id,
        c.name as category_name,
        cb.amount,
        cb.remaining_amount,
        cb.description
      FROM category_budgets cb
      JOIN categories c ON cb.category_id = c.id
      WHERE cb.budget_id = ?
      ORDER BY c.name ASC
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [budget_id]);

        return rows as CategoryBudgetDetail[];
    }

    // Găsește toate bugetele unui user (fără category_budgets - pentru listări simple)
    async findAllByUser(user_id: number): Promise<Budget[]> {
        const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY year DESC, month DESC
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [user_id]);

        return rows as Budget[];
    }

    // Actualizează un buget
    async update(id: number, data: UpdateBudgetDTO): Promise<Budget | null> {
        const { total_budget } = data;

        const query = `
      UPDATE budgets 
      SET total_budget = ?
      WHERE id = ?
    `;

        try {
            await pool.execute(query, [total_budget, id]);
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    // Șterge un buget
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM budgets WHERE id = ?';

        const [result] = await pool.execute<ResultSetHeader>(query, [id]);

        return result.affectedRows > 0;
    }

    // Verifică dacă bugetul aparține user-ului
    async belongsToUser(id: number, user_id: number): Promise<boolean> {
        const query = 'SELECT id FROM budgets WHERE id = ? AND user_id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id, user_id]);

        return rows.length > 0;
    }
}

export default new BudgetModel();
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';

export interface CategoryBudget {
    id: number;
    budget_id: number;
    category_id: number;
    amount: number;
    remaining_amount: number;
    description: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CategoryBudgetWithDetails extends CategoryBudget {
    category_name: string;
}

export interface CreateCategoryBudgetDTO {
    budget_id: number;
    category_id: number;
    amount: number;
    description?: string;
}

export interface UpdateCategoryBudgetDTO {
    amount?: number;
    remaining_amount?: number;
    description?: string;
}

class CategoryBudgetModel {
    // Crează un category budget
    async create(data: CreateCategoryBudgetDTO): Promise<CategoryBudget | null> {
        const { budget_id, category_id, amount, description } = data;

        const query = `
      INSERT INTO category_budgets (budget_id, category_id, amount, remaining_amount, description)
      VALUES (?, ?, ?, ?, ?)
    `;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                query,
                [budget_id, category_id, amount, amount, description || null]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Găsește category budget după ID
    async findById(id: number): Promise<CategoryBudget | null> {
        const query = 'SELECT * FROM category_budgets WHERE id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as CategoryBudget;
    }

    // Găsește toate category budgets pentru un buget
    async findAllByBudget(budget_id: number): Promise<CategoryBudgetWithDetails[]> {
        const query = `
      SELECT 
        cb.*,
        c.name as category_name
      FROM category_budgets cb
      JOIN categories c ON cb.category_id = c.id
      WHERE cb.budget_id = ?
      ORDER BY c.name ASC
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [budget_id]);

        return rows as CategoryBudgetWithDetails[];
    }

    // Găsește category budget specific
    async findByBudgetAndCategory(budget_id: number, category_id: number): Promise<CategoryBudget | null> {
        const query = 'SELECT * FROM category_budgets WHERE budget_id = ? AND category_id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(
            query,
            [budget_id, category_id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as CategoryBudget;
    }

    // Actualizează category budget
    async update(id: number, data: UpdateCategoryBudgetDTO): Promise<CategoryBudget | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.amount !== undefined) {
            updates.push('amount = ?');
            values.push(data.amount);
        }

        if (data.remaining_amount !== undefined) {
            updates.push('remaining_amount = ?');
            values.push(data.remaining_amount);
        }

        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        values.push(id);

        const query = `
      UPDATE category_budgets 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

        try {
            await pool.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    // Șterge category budget
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM category_budgets WHERE id = ?';

        const [result] = await pool.execute<ResultSetHeader>(query, [id]);

        return result.affectedRows > 0;
    }

    // Actualizează remaining_amount după adăugarea unei cheltuieli
    async updateRemainingAmount(id: number, expenseAmount: number): Promise<void> {
        const query = `
      UPDATE category_budgets 
      SET remaining_amount = remaining_amount - ?
      WHERE id = ?
    `;

        await pool.execute(query, [expenseAmount, id]);
    }

    // Calculează total alocat pe categorii pentru un buget
    async getTotalAllocated(budget_id: number): Promise<number> {
        const query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM category_budgets
      WHERE budget_id = ?
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [budget_id]);

        return rows[0].total;
    }
}

export default new CategoryBudgetModel();
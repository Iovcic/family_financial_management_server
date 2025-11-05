
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { IBudget, ICreateBudgetDTO, IUpdateBudgetDTO } from './types.js';


class BudgetModel {
    // Crează un buget nou
    async create(data: ICreateBudgetDTO): Promise<IBudget | null> {
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
    async findById(id: number): Promise<IBudget | null> {
        const query = 'SELECT * FROM budgets WHERE id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as IBudget;
    }

    // Găsește buget după user_id, month și year
    async findByUserAndDate(user_id: number, month: number, year: number): Promise<IBudget | null> {
        const query = 'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(
            query,
            [user_id, month, year]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as IBudget;
    }

    // Găsește toate bugetele unui user
    async findAllByUser(user_id: number): Promise<IBudget[]> {
        const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      ORDER BY year DESC, month DESC
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [user_id]);

        return rows as IBudget[];
    }

    // Actualizează un buget
    async update(id: number, data: IUpdateBudgetDTO): Promise<IBudget | null> {
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
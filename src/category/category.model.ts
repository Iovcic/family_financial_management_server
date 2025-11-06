
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';

export interface Category {
    id: number;
    user_id: number;
    name: string;
    created_at: Date;
}

export interface CreateCategoryDTO {
    user_id: number;
    name: string;
}

class CategoryModel {
    // Crează o categorie nouă
    async create(data: CreateCategoryDTO): Promise<Category | null> {
        const { user_id, name } = data;

        const query = `
      INSERT INTO categories (user_id, name)
      VALUES (?, ?)
    `;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                query,
                [user_id, name.trim()]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Găsește categorie după ID
    async findById(id: number): Promise<Category | null> {
        const query = 'SELECT * FROM categories WHERE id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Category;
    }

    // Găsește toate categoriile unui user
    async findAllByUser(user_id: number): Promise<Category[]> {
        const query = `
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY name ASC
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [user_id]);

        return rows as Category[];
    }

    // Găsește categorie după nume și user
    async findByNameAndUser(user_id: number, name: string): Promise<Category | null> {
        const query = 'SELECT * FROM categories WHERE user_id = ? AND name = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(
            query,
            [user_id, name.trim()]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Category;
    }

    // Verifică dacă categoria aparține user-ului
    async belongsToUser(id: number, user_id: number): Promise<boolean> {
        const query = 'SELECT id FROM categories WHERE id = ? AND user_id = ?';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id, user_id]);

        return rows.length > 0;
    }

    // Șterge o categorie
    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM categories WHERE id = ?';

        try {
            const [result] = await pool.execute<ResultSetHeader>(query, [id]);
            return result.affectedRows > 0;
        } catch (error: any) {
            // Dacă este eroare de foreign key constraint
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new Error('Cannot delete category because it is being used in budgets or expenses');
            }
            throw error;
        }
    }

    // Autocomplete - caută categorii după prefix
    async searchByName(user_id: number, searchTerm: string): Promise<Category[]> {
        const query = `
      SELECT * FROM categories 
      WHERE user_id = ? AND name LIKE ?
      ORDER BY name ASC
      LIMIT 10
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(
            query,
            [user_id, `${searchTerm.trim()}%`]
        );

        return rows as Category[];
    }
}

export default new CategoryModel();
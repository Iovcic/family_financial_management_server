
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { IToken, IUser, IUserLogin, IUserRegister } from '../user/types/index.js';

class AuthModel {
    async register(data: IUserRegister): Promise<void> {
        const { name, email, password } = data;

        const query = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            `;

        try {
            await pool.execute<ResultSetHeader>(
                query,
                [name, email, password]
            );
        } catch (error) {
            throw error;
        }
    }

    async login(data: IUserLogin): Promise<void> {
        const { user_id, token, expires_at } = data;
        console.log('dd')
        const query = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;

        try {
            const dd = await pool.execute<ResultSetHeader>(
                query,
                [user_id, token, expires_at]
            );


        } catch (error) {

            throw error;
        }
    }

    async storeRefreshToken({ user_id, refresh_token, expires_at }: { user_id: number, refresh_token: string, expires_at: Date }): Promise<void> {

        const query = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [user_id, refresh_token, expires_at]);

        if (rows.length === 0) {
            return;
        }

        return;
    }

    async updateRefreshToken(data: {
        newRefreshToken: string;
        token_id: number;
    }): Promise<void> {
        const { newRefreshToken, token_id } = data;

        const query = `UPDATE refresh_tokens SET revoked = TRUE, replaced_by_token = ? WHERE id = ?`;

        try {
            await pool.execute<ResultSetHeader>(
                query,
                [newRefreshToken, token_id]
            );
        } catch (error) {
            throw error;
        }
    }

    async cancelRefreshToken(data: {
        refreshToken: string;
        userId: number;
    }): Promise<void> {
        const { refreshToken, userId } = data;

        const query = `UPDATE refresh_tokens SET revoked = TRUE WHERE token = ? AND user_id = ?`;

        try {
            await pool.execute<ResultSetHeader>(
                query,
                [refreshToken, userId]
            );
        } catch (error) {
            throw error;
        }
    }

    async getUserTokenVersion(data: {
        user_id: number;
    }): Promise<number> {
        const { user_id } = data;

        const query = `SELECT token_version FROM users WHERE id = ?`;

        try {
            const userTokens = await pool.execute<ResultSetHeader>(
                query,
                [user_id]
            );

            return userTokens[0].token_version;
        } catch (error) {
            throw error;
        }
    }

    async getUserToken(data: {
        user_id: number;
        token: string;
    }): Promise<IToken | null> {
        const { user_id, token } = data;

        const query = `SELECT id, revoked, expires_at FROM refresh_tokens WHERE token = ? AND user_id = ? limit 1`;

        try {
            const userToken = await pool.execute<ResultSetHeader>(
                query,
                [token, user_id]
            ) as unknown as IToken[];

            if (!(userToken?.[0]?.user_id)) {
                return null;
            }

            return userToken[0];
        } catch (error) {
            throw error;
        }
    }

    // Găsește email
    async findUserByEmail(email: string): Promise<IUser | null> {
        const conn = pool.getConnection();
        const query = 'SELECT * FROM users WHERE email = ? limit 1';

        try {
            const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);

            if (rows.length === 0) {
                return null;
            }

            return rows[0] as IUser;
        } catch (error) {
            throw error;
        } finally {
            (await conn).release()
        }
    }

    async findUserById(id: number): Promise<IUser | null> {
        const conn = pool.getConnection();
        const query = 'SELECT * FROM users WHERE id = ? limit 1';

        try {
            const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            return rows[0] as IUser;
        } catch (error) {
            throw error;
        } finally {
            (await conn).release()
        }
    }
}

export default new AuthModel();
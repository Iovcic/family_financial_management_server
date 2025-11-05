import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'budget_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test conexiunea
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Error connecting to MySQL database:', error);
        throw error;
    }
};

export default pool;
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate tokens
const generateTokens = (userId, tokenVersion) => {
    const accessToken = jwt.sign(
        { userId, tokenVersion },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { userId, tokenVersion },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};

// Verify access token middleware
const verifyAccessToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.userId = decoded.userId;
        req.tokenVersion = decoded.tokenVersion;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Register endpoint
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const conn = await pool.getConnection();

    try {
        // Check if user exists
        const [existingUser] = await conn.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await conn.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name || '', email, hashedPassword, 'user']
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const conn = await pool.getConnection();

    try {
        const [users] = await conn.query(
            'SELECT id, password, token_version, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.token_version);

        // Calculate expiry (7 days from now)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Store refresh token in database
        await conn.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, refreshToken, expiresAt]
        );

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            userId: user.id,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Refresh token endpoint
app.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    const conn = await pool.getConnection();

    try {
        // Verify refresh token JWT
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // Check if token exists in database and is not revoked
        const [tokens] = await conn.query(
            'SELECT id, revoked, expires_at FROM refresh_tokens WHERE token = ? AND user_id = ?',
            [refreshToken, decoded.userId]
        );

        if (tokens.length === 0 || tokens[0].revoked) {
            return res.status(403).json({ message: 'Invalid or revoked refresh token' });
        }

        // Check if token has expired
        if (new Date() > new Date(tokens[0].expires_at)) {
            return res.status(403).json({ message: 'Refresh token expired' });
        }

        // Get user to verify token version
        const [users] = await conn.query(
            'SELECT token_version FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0 || users[0].token_version !== decoded.tokenVersion) {
            return res.status(403).json({ message: 'Token version mismatch' });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            decoded.userId,
            users[0].token_version
        );

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Mark old token as replaced and store new token
        await conn.query(
            'UPDATE refresh_tokens SET revoked = TRUE, replaced_by_token = ? WHERE id = ?',
            [newRefreshToken, tokens[0].id]
        );

        await conn.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [decoded.userId, newRefreshToken, expiresAt]
        );

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        res.status(500).json({ message: 'Token refresh failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Protected endpoint - Get user profile
app.get('/profile', verifyAccessToken, async (req, res) => {
    const conn = await pool.getConnection();

    try {
        const [users] = await conn.query(
            'SELECT id, name, email, role, email_verified FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile retrieved', user: users[0] });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
    } finally {
        conn.release();
    }
});

// Logout endpoint
app.post('/logout', verifyAccessToken, async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.query(
            'UPDATE refresh_tokens SET revoked = TRUE WHERE token = ? AND user_id = ?',
            [refreshToken, req.userId]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Logout failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Logout from all devices
app.post('/logout-all', verifyAccessToken, async (req, res) => {
    const conn = await pool.getConnection();

    try {
        // Revoke all refresh tokens for this user
        await conn.query(
            'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ? AND revoked = FALSE',
            [req.userId]
        );

        // Increment token version to invalidate all existing tokens
        await conn.query(
            'UPDATE users SET token_version = token_version + 1 WHERE id = ?',
            [req.userId]
        );

        res.json({ message: 'Logged out from all devices' });
    } catch (err) {
        res.status(500).json({ message: 'Logout all failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Verify email endpoint (example)
app.post('/verify-email', verifyAccessToken, async (req, res) => {
    const conn = await pool.getConnection();

    try {
        await conn.query(
            'UPDATE users SET email_verified = TRUE WHERE id = ?',
            [req.userId]
        );

        res.json({ message: 'Email verified' });
    } catch (err) {
        res.status(500).json({ message: 'Verification failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Request password reset
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email required' });
    }

    const conn = await pool.getConnection();

    try {
        const resetToken = jwt.sign({ email }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await conn.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, resetTokenExpiry, email]
        );

        // In production, send email with reset link
        res.json({ message: 'Password reset link sent to email', resetToken });
    } catch (err) {
        res.status(500).json({ message: 'Failed to process request', error: err.message });
    } finally {
        conn.release();
    }
});

// Reset password
app.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: 'Reset token and new password required' });
    }

    const conn = await pool.getConnection();

    try {
        const [users] = await conn.query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [resetToken]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await conn.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Password reset failed', error: err.message });
    } finally {
        conn.release();
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
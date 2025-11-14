import { Request, Response } from 'express';
import { IUser } from '../user/types/index.js';

import bcrypt from 'bcrypt';
import AuthModel from './auth.model.js';
import { generateTokens, getExpiredDate, validateToken } from '../lib/authentificaiton/index.js';

class AuthController {

    async register(req: Request, res: Response): Promise<{} | undefined> {
        try {
            const { email, password, name }: IUser = req.body;

            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Email and password required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Verifică dacă emailul este unic
            const existing = await AuthModel.findUserByEmail(email);
            if (existing) {
                res.status(409).json({
                    status: 0,
                    message: `User already exists.`
                });
                return;
            }

            // Crează userul
            await AuthModel.register({ email, name, password: hashedPassword });

            res.status(201).json({
                status: 1,
                message: 'User created successfully',
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({
                status: 0,
                message: 'Internal server error'
            });
        }
    }

    async login(req: Request, res: Response): Promise<{} | undefined> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }


        try {
            const user = await AuthModel.findUserByEmail(email);

            if (!user) {
                return res.status(401).json({ status: 0, message: 'Invalid credentials' });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ status: 0, message: 'Invalid credentials' });
            }

            const { accessToken, refreshToken } = generateTokens(user.id, user.token_version);

            // Calculate expiry (7 days from now)
            const expiresAt = getExpiredDate();

            await AuthModel.storeRefreshToken({
                user_id: user.id,
                refresh_token: refreshToken,
                expires_at: expiresAt
            });

            res.json({
                status: 1,
                message: 'Login successful',
                accessToken,
                refreshToken,
                userId: user.id,
                role: user.role
            });
        } catch (err: Error) {

            res.status(500).json({ message: 'Login failed', error: err.message });
        }

    }

    async refreshToken(req: Request, res: Response): Promise<{} | undefined> {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        try {
            // Verify refresh token JWT
            const decoded = validateToken(refreshToken);

            // Check if token exists in database and is not revoked
            const token = await AuthModel.getUserToken({
                token: refreshToken,
                user_id: decoded.userId
            })

            if (!token || token.revoked) {
                return res.status(403).json({ message: 'Invalid or revoked refresh token' });
            }

            // Check if token has expired
            if (new Date() > new Date(token.expires_at)) {
                return res.status(403).json({ message: 'Refresh token expired' });
            }

            const tokenVersion = await AuthModel.getUserTokenVersion({
                user_id: decoded.userId
            })

            if (!tokenVersion || tokenVersion !== decoded.tokenVersion) {
                return res.status(403).json({ message: 'Token version mismatch' });
            }

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(
                decoded.userId,
                tokenVersion
            );

            const expiresAt = getExpiredDate();

            // Mark old token as replaced and store new token
            await AuthModel.cancelRefreshToken({
                newRefreshToken: refreshToken,
                token_id: token.id
            })

            await AuthModel.storeRefreshToken({
                user_id: decoded.userId,
                expires_at: expiresAt,
                refresh_token: newRefreshToken
            })

            res.json({ accessToken, refreshToken: newRefreshToken });
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            res.status(500).json({ message: 'Token refresh failed', error: err.message });
        }
    }

    async logout(req: Request, res: Response): Promise<{} | undefined> {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        try {
            await AuthModel.cancelRefreshToken({
                refreshToken,
                userId: req.userId
            })
            res.json({ status: 1, message: 'Logged out successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Logout failed', error: err.message });
        }
    }

    async getCurrentuser(req: Request, res: Response): Promise<{} | undefined> {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: 'Email and password required' });
        }


        try {
            const user = await AuthModel.findUserById(userId);

            if (!user) {
                return res.status(401).json({ status: 0, message: 'Invalid credentials' });
            }

            res.json({
                status: 1,
                message: 'Login successful',
                data: user
            });
        } catch (err: Error) {

            res.status(500).json({ message: 'Login failed', error: err.message });
        }

    }
}

export default new AuthController();
import { validateToken } from "../lib/authentificaiton/index.js";

// Verify access token middleware
export const verifyAccessToken = (req: {
    userId: number;
    tokenVersion: number;
    headers: any;
}, res: any, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = validateToken(token);

        req.userId = decoded.userId;
        req.tokenVersion = decoded.tokenVersion;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

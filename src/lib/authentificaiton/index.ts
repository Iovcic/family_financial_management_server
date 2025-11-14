import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

export const generateTokens = (userId: number, tokenVersion: number) => {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        return ({
            accessToken: "",
            refreshToken: ""
        });
    }


    const accessToken = jwt.sign(
        { userId, tokenVersion },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN + 'm' }
    );

    const refreshToken = jwt.sign(
        { userId, tokenVersion },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN + 'd' }
    );

    return ({
        accessToken,
        refreshToken
    })
}

export const validateToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

export const getExpiredDate = () => {
    return new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000)
}
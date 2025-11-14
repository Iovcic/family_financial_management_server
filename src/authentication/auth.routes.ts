import { Router } from 'express';
import AuthController from './auth.controller.js';
import { verifyAccessToken } from './authmiddleware.js';

export const AuthRouter = Router();
export const LoggedRouter = Router();

LoggedRouter.use(verifyAccessToken)


AuthRouter.post('/login', AuthController.login);
AuthRouter.post('/register', AuthController.register);
LoggedRouter.post('/refresh', AuthController.refreshToken);
LoggedRouter.post('/logout', AuthController.logout);
LoggedRouter.get('/me', AuthController.getCurrentuser);

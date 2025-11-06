import { Router } from 'express';
import categoryController from './category.controller.js';

export const CategoryRouter = Router();

CategoryRouter.post('/', categoryController.create);
CategoryRouter.get('/user/:userId', categoryController.getAllByUser);
CategoryRouter.get('/search/:userId', categoryController.search);
CategoryRouter.delete('/:id', categoryController.delete);
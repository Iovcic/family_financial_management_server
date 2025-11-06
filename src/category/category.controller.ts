import { Request, Response } from 'express';
import CategoryModel, { CreateCategoryDTO } from './category.model.js';

class CategoryController {
  // POST /api/categories - Crează o categorie
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, name }: CreateCategoryDTO = req.body;

      if (!user_id || !name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, name'
        });
        return;
      }

      // Verifică dacă categoria deja există pentru acest user
      const existing = await CategoryModel.findByNameAndUser(user_id, name);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Category already exists'
        });
        return;
      }

      const category = await CategoryModel.create({ user_id, name });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /api/categories/user/:userId - Obține toate categoriile unui user
  async getAllByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const categories = await CategoryModel.findAllByUser(userId);

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /api/categories/search/:userId?q=term - Autocomplete
  async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const searchTerm = req.query.q as string;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
        return;
      }

      const categories = await CategoryModel.searchByName(userId, searchTerm);

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error searching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // DELETE /api/categories/:id - Șterge o categorie
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
        return;
      }

      const existing = await CategoryModel.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      await CategoryModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      if (error.message.includes('being used')) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new CategoryController();
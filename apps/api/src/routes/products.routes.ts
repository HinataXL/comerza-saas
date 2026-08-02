import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all product routes
router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

import express from 'express';
import {
    createProductImage,
    getProductImage,
    getAllProductImages,
    updateProductImage,
    deleteProductImage,
} from '../controllers/productImageController.js';

const router = express.Router();

router.post('/', createProductImage);
router.get('/', getAllProductImages);
router.get('/:id', getProductImage);
router.put('/:id', updateProductImage);
router.delete('/:id', deleteProductImage);

export default router;

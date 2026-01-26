import express from 'express';
import {
    createProductVariant,
    getProductVariant,
    getAllProductVariants,
    updateProductVariant,
    deleteProductVariant,
} from '../controllers/productVariantController.js';

const router = express.Router();

router.post('/', createProductVariant);
router.get('/', getAllProductVariants);
router.get('/:id', getProductVariant);
router.put('/:id', updateProductVariant);
router.delete('/:id', deleteProductVariant);

export default router;

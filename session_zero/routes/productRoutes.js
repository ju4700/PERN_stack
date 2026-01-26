import express from 'express';
import { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct,} from '../controllers/productController.js';
import { createProductImage, getAllProductImages } from '../controllers/productImageController.js';
import { createProductVariant, getAllProductVariants } from '../controllers/productVariantController.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:productId/images', (req, res) => {
	req.query.productId = req.params.productId;
	return getAllProductImages(req, res);
});
router.post('/:productId/images', (req, res) => {
	req.body = { ...req.body, productId: req.params.productId };
	return createProductImage(req, res);
});
router.get('/:productId/variants', (req, res) => {
	req.query.productId = req.params.productId;
	return getAllProductVariants(req, res);
});
router.post('/:productId/variants', (req, res) => {
	req.body = { ...req.body, productId: req.params.productId };
	return createProductVariant(req, res);
});
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

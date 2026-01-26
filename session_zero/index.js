import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productImageRoutes from './routes/productImageRoutes.js';
import productVariantRoutes from './routes/productVariantRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/product-images', productImageRoutes);
app.use('/product-variants', productVariantRoutes);
app.use('/orders', orderRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
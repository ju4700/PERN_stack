import { z } from 'zod';
import { prisma } from '../database/prisma.js';

const toNumber = (value) => {
    if (value === null || typeof value === 'undefined') return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    if (typeof value === 'object' && typeof value.toString === 'function') return Number(value.toString());
    return Number(value);
};

export const getAllOrders = async (req, res) => {
    const { status, payment_status } = req.query;

    const where = { user_id: req.user.id };
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;

    try {
        const orders = await prisma.orders.findMany({
            where,
            orderBy: [{ created_at: 'desc' }],
            include: { order_items: true },
        });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching orders', error: e.message });
    }
};

export const getOrder = async (req, res) => {
    const id = req.params.id;

    try {
        const order = await prisma.orders.findUnique({
            where: { id },
            include: { order_items: true },
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
        res.json(order);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching order', error: e.message });
    }
};

export const updateOrder = async (req, res) => {
    const id = req.params.id;

    const schema = z.object({
        status: z.string().min(1).optional(),
        paymentStatus: z.string().min(1).optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const existing = await prisma.orders.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Order not found' });
        if (existing.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        const updated = await prisma.orders.update({
            where: { id },
            data: {
                status: data.status,
                payment_status: data.paymentStatus,
            },
        });

        res.json({ message: 'Order updated', order: updated });
    } catch (e) {
        res.status(500).json({ message: 'Error updating order', error: e.message });
    }
};

export const deleteOrder = async (req, res) => {
    const id = req.params.id;

    try {
        const existing = await prisma.orders.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Order not found' });
        if (existing.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        if (existing.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be deleted' });
        }

        await prisma.order_items.deleteMany({ where: { order_id: id } });
        const deleted = await prisma.orders.delete({ where: { id } });

        res.json({ message: 'Order deleted', order: deleted });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting order', error: e.message });
    }
};

export const checkout = async (req, res) => {
    const schema = z.object({
        cartId: z.string().uuid().optional(),
        paymentMethod: z.string().min(1),
        shippingAddress: z.record(z.any()),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const cart = data.cartId
                ? await tx.carts.findUnique({ where: { id: data.cartId } })
                : await tx.carts.findFirst({ where: { user_id: req.user.id }, orderBy: [{ created_at: 'desc' }] });

            if (!cart) {
                return { error: { status: 404, message: 'Cart not found' } };
            }

            if (cart.user_id !== req.user.id) {
                return { error: { status: 403, message: 'Forbidden' } };
            }

            const items = await tx.cart_items.findMany({
                where: { cart_id: cart.id },
                include: { product: true, product_var: true },
                orderBy: [{ added_at: 'asc' }],
            });

            if (!items.length) {
                return { error: { status: 400, message: 'Cart is empty' } };
            }

            let total = 0;
            const orderItemsCreate = [];

            for (const item of items) {
                const quantity = item.quantity ?? 1;
                if (!item.product) {
                    return { error: { status: 400, message: 'Cart contains invalid product' } };
                }

                const basePrice = toNumber(item.product.discounted_price ?? item.product.price);
                const variantAdjustment = item.product_var ? toNumber(item.product_var.price_adjustment) : 0;
                const unitPrice = basePrice + variantAdjustment;
                const lineTotal = unitPrice * quantity;

                if (item.product_var) {
                    const available = item.product_var.stock_quantity ?? 0;
                    if (available < quantity) {
                        return {
                            error: {
                                status: 400,
                                message: `Insufficient stock for variant ${item.product_var.id}`,
                            },
                        };
                    }
                } else {
                    const available = item.product.stock_qn ?? 0;
                    if (available < quantity) {
                        return {
                            error: {
                                status: 400,
                                message: `Insufficient stock for product ${item.product.id}`,
                            },
                        };
                    }
                }

                total += lineTotal;

                orderItemsCreate.push({
                    product_id: item.product_id,
                    product_snap: {
                        id: item.product.id,
                        name: item.product.name,
                        slug: item.product.slug,
                        price: item.product.price?.toString?.() ?? item.product.price,
                        discounted_price: item.product.discounted_price?.toString?.() ?? item.product.discounted_price,
                    },
                    variant_snap: item.product_var
                        ? {
                              id: item.product_var.id,
                              variant_name: item.product_var.variant_name,
                              variant_val: item.product_var.variant_val,
                              price_adjustment: item.product_var.price_adjustment?.toString?.() ?? item.product_var.price_adjustment,
                              img_url: item.product_var.img_url,
                          }
                        : {},
                    quantity,
                    price_at_purchase: unitPrice.toFixed(2),
                    total_price: lineTotal.toFixed(2),
                });
            }

            for (const item of items) {
                const quantity = item.quantity ?? 1;
                if (item.product_var) {
                    await tx.product_var.update({
                        where: { id: item.product_var.id },
                        data: { stock_quantity: { decrement: quantity } },
                    });
                } else {
                    await tx.product.update({
                        where: { id: item.product.id },
                        data: { stock_qn: { decrement: quantity } },
                    });
                }
            }

            const createdOrder = await tx.orders.create({
                data: {
                    user_id: req.user.id,
                    status: 'pending',
                    total_amout: total.toFixed(2),
                    shipping_add_snapshot: data.shippingAddress,
                    payment_method: data.paymentMethod,
                    payment_status: 'pending',
                    order_items: {
                        create: orderItemsCreate,
                    },
                },
                include: { order_items: true },
            });

            await tx.cart_items.deleteMany({ where: { cart_id: cart.id } });

            return { order: createdOrder };
        });

        if (result?.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        res.json({ message: 'Checkout successful', order: result.order });
    } catch (e) {
        res.status(500).json({ message: 'Checkout failed', error: e.message });
    }
};

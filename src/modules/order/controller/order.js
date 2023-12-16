import { create, find, findById, findByIdAndUpdate, findOne, findOneAndDelete, findOneAndUpdate } from "../../../../DB/DBMethods.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import cartModel from "../../../../DB/model/cart.model.js";


export const createDummyOrder =
    asyncHandler(
        async (req, res, next) => {

            const { products } = req.body;
            let finalProducts = []
            let sumTotalPrice = 0;

            for (let i = 0; i < products.length; i++) {
                let product = products[i]
                const checkedProduct = await findOne({
                    model: productModel,
                    filter: { _id: product.productId, stock: { $gte: product.quantity }, isDeleted: false }
                })
                if (!checkedProduct) {
                    return next(new Error(`fail to place this item to the order ${product.productId} `, { cause: 400 }))
                }
                product.totalPrice = (product.quantity * checkedProduct.finalPrice)
                sumTotalPrice = sumTotalPrice + product.totalPrice
                product.unitPrice = checkedProduct.finalPrice
                product.image = checkedProduct.image
                product.name = checkedProduct.name
                finalProducts.push(product)
            }
            req.body.totalPrice = sumTotalPrice

            const order = {
                userId: {
                    _id: req.user._id,
                    userName: req.user.userName
                },
                totalPrice: sumTotalPrice,
                products: finalProducts,
                address: req.user.address,
                phone: req.user.phone
            }

            if (order) {
                return res.status(200).json({ message: "Done", order })
            } else {
                return res.status(400).json({ message: "Fail" })
            }
        }
    )

export const createOrder = asyncHandler(
    async (req, res, next) => {
        const { products, address, phone } = req.body;
        let finalProducts = []
        let sumTotalPrice = 0;

        for (let i = 0; i < products.length; i++) {
            let product = products[i]
            const checkedProduct = await findOne({
                model: productModel,
                filter: { _id: product.productId, stock: { $gte: product.quantity }, isDeleted: false }
            })
            if (!checkedProduct) {
                return next(new Error(`fail to place this item to the order ${product.productId} `, { cause: 400 }))
            }
            product.totalPrice = (product.quantity * checkedProduct.finalPrice)
            sumTotalPrice = sumTotalPrice + product.totalPrice
            product.unitPrice = checkedProduct.finalPrice
            finalProducts.push(product)
        }

        req.body.totalPrice = sumTotalPrice
        const order = await create({
            model: orderModel,
            data: {
                userId: req.user._id,
                totalPrice: sumTotalPrice,
                products: finalProducts,
                address,
                phone
            }
        })

        if (order) {
            for (const product of products) {
                await findOneAndUpdate({
                    model: productModel,
                    filter: { _id: product.productId },
                    data: { $inc: { stock: -parseInt(product.quantity) } }
                })
            }
            await findOneAndUpdate({
                model: cartModel,
                filter: {
                    userId: req.user._id
                },
                data: {
                    products: []
                }
            })
            return res.status(201).json({ message: "Done", order })
        } else {
            return res.status(400).json({ message: "Fail" })
        }
    }
)

export const cancelOrder = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const checkOrder = await findOne({
            model: orderModel,
            filter: {
                _id: id,
                userId: req.user._id
            }
        })
        if (!checkOrder) {
            return next(new Error("Order not exist", { cause: 404 }))
        }
        if (checkOrder.status != 'Placed') {
            return next(new Error(`Can not cancel order after it been ${checkOrder.status} by system`, { cause: 400 }))
        }


        const order = await findOneAndDelete({
            model: orderModel,
            filter: {
                _id: id,
                status: "Placed",
                userId: req.user._id
            }
        })

        for (const product of order.products) {
            await findOneAndUpdate({
                model: productModel,
                filter: { _id: product.productId },
                data: { $inc: { stock: parseInt(product.quantity) } }
            })
        }
        return res.status(200).json({ message: "Done" })
    }
)

export const changeReportState = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        req.body.updatedBy = req.user._id

        const order = await findById({
            model: orderModel,
            filter: {
                _id: id
            }
        })
        if (!order) {
            return next(new Error("In-valid order ID", { cause: 404 }))
        }

        if (req.body.status == 'Delivered' && order.status == "Delivered") {
            return res.status(400).json({ message: "Already Delivered before", status: order.status })
        } else if (req.body.status == 'Delivered' && order.status == "Rejected") {
            return res.status(400).json({ message: "Can not deliver product after admin rejected it", status: order.status })
        } else if (req.body.status == 'Delivered' && order.status == "Canceled") {
            return res.status(400).json({ message: "Can not deliver product client Canceled it", status: order.status })
        }

        else if (req.body.status == 'On-way' && order.status == "On-way") {
            return res.status(400).json({ message: "Already out", status: order.status })
        } else if (req.body.status == 'On-way' && order.status == "Rejected") {
            return res.status(400).json({ message: "Can not set order On-way  when admin rejected it", status: order.status })
        } else if (req.body.status == 'On-way' && order.status == "Canceled") {
            return res.status(400).json({ message: "Can not set order On-way when client Canceled it", status: order.status })
        }

        else if (req.body.status == 'Rejected' && order.status == "Rejected") {
            return res.status(400).json({ message: "Already rejected before", status: order.status })
        } else if (req.body.status == 'Rejected' && order.status == "Canceled") {
            return res.status(400).json({ message: "Can not Reject order  when client Canceled it", status: order.status })
        } else if (req.body.status == 'Rejected' && order.status == "Delivered") {
            return res.status(400).json({ message: "Can not Reject order  after client Delivered it", status: order.status })
        }

        const updateOrder = await findOneAndUpdate({
            model: orderModel,
            filter: {
                _id: id,
                status: { $ne: "Delivered" }
            },
            data: req.body
        })


        if (req.body.status == 'Rejected') {

            for (const product of updateOrder.products) {
                await findOneAndUpdate({
                    model: productModel,
                    filter: { _id: product.productId },
                    data: { $inc: { stock: parseInt(product.quantity) } }
                })
            }
        }
        return res.status(200).json({ message: "Done", updateOrder })

    }
)


export const getPlacedOrders = asyncHandler(
    async (req, res, next) => {
        const orders = await find({
            model: orderModel,
            filter: {
                status: "Placed"
            },
            populate: [
                {
                    path: "userId",
                    select: "userName image email position"
                },
                {
                    path: "products.productId",
                    select: "name image price finalPrice stock"
                }
            ],

        })
        return res.status(200).json({ message: "Done", orders })
    }
)



export const getAllOrders = asyncHandler(
    async (req, res, next) => {
        const orders = await find({
            model: orderModel,
            populate: [
                {
                    path: "userId",
                    select: "userName image email"
                },
                {
                    path: "products.productId",
                    select: "name image price finalPrice stock"
                }
            ],
            sort: [['status', '1']]

        })
        return res.status(200).json({ message: "Done", orders })
    }
)

export const userOrders = asyncHandler(
    async (req, res, next) => {
        const orders = await find({
            model: orderModel,
            filter: {
                userId: req.user._id
            },
            populate: [
                {
                    path: "userId",
                    select: "userName image email"
                },
                {
                    path: "products.productId",
                    select: "name image price  finalPrice stock"
                },

            ],
            sort: [['createdAt', "-1"]]
        })
        return res.status(200).json({ message: "Done", orders })
    }
)

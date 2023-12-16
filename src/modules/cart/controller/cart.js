import { create, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../../../DB/DBMethods.js";
import cartModel from "../../../../DB/model/cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../services/errorHandling.js";


export const addToCart = asyncHandler(async (req, res, next) => {

    const { product } = req.body
    const { _id } = req.user

    const checkProduct = await findOne({
        model: productModel,
        filter: { _id: product.productId }
    })
    if (!checkProduct) {
        return next(new Error("Product not found", { cause: 404 }))
    }

    if (checkProduct.stock == 0 || checkProduct.isDeleted) {

        await findByIdAndUpdate({
            model: productModel,
            filter: product.productId,
            data: {
                $addToSet: { wishUsers: _id }
            }
        })
        return next(new Error("This product is out of stock we will notify you once it become available again.", { cause: 404 }))
    }
    if (checkProduct.stock < product.quantity) {
        return next(new Error(`Sorry this product  quantity are out of stock maximum available unit is ${checkProduct.stock}`, { cause: 404 }))
    }
    const findCart = await findOne({
        model: cartModel,
        filter: { userId: _id }
    })
    // if user enter product to cart first time we create cart for him and add his products list
    if (!findCart) {
        const cart = await create({
            model: cartModel,
            data: {
                userId: _id,
                products: [product]
            }
        })
        return res.status(201).json({ message: "Done", cart })
    }

    // update exist cart
    let match = false;
    for (let i = 0; i < findCart.products.length; i++) {
        if (product.productId == findCart.products[i].productId.toString()) {
            findCart.products[i] = product
            match = true;
            break;
        }
    }
    if (!match) {
        findCart.products.push(product)
    }

    const updatedCart = await findOneAndUpdate({
        model: cartModel,
        filter: { userId: _id },
        data: { products: findCart.products },
        options: { new: true }
    })
    return res.status(200).json({ message: "Done", cart: updatedCart })
})
export const removeFromCart = asyncHandler(async (req, res, next) => {

    const { productId } = req.body
    const { _id } = req.user
    const cart = await findOne({
        model: cartModel,
        filter: { userId: _id }
    })

    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products.splice(i, 1)
            break
        }
    }
    const updatedCart = await findByIdAndUpdate({
        model: cartModel,
        filter: cart._id,
        data: {
            products: cart.products
        },
        options: {
            new: true
        }
    })

    return res.status(200).json({ message: "Done", cart: updatedCart })
})

export const clearCart = asyncHandler(async (req, res, next) => {

    const { _id } = req.user
    const updatedCart = await findOneAndUpdate({
        model: cartModel,
        filter: { userId: _id },
        data: {
            products: []
        },
        options: {
            new: true
        }
    })

    return res.status(200).json({ message: "Done", cart: updatedCart })
})
export const getCart = asyncHandler(async (req, res, next) => {

    const cart = await findOne({
        model: cartModel,
        filter: {
            userId: req.user._id,
        },
        populate: [
            {
                path: "products.productId"
            }
        ]
    })
    return res.status(200).json({ message: "Done", cart })
})
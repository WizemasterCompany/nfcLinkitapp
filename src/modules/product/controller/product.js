import { create, find, findById, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../../../DB/DBMethods.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import slugify from 'slugify'
import productModel from "../../../../DB/model/Product.model.js";

export const createProduct = asyncHandler(
    async (req, res, next) => {
        if (!req.file) {
            return next(new Error('Image is required', { cause: 400 }))
        } else {
            const { name } = req.body
            const checkName = await findOne({
                model: productModel,
                filter: { name }
            })

            if (checkName) {
                return next(new Error("Duplicate name", { cause: 409 }))
            }
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `NFCard/Products` })
            req.body.slug = slugify(name)
            req.body.image = secure_url;
            req.body.imagePublicId = public_id;
            req.body.createdBy = req.user._id;
            if (req.body.discount) {
                req.body.finalPrice = req.body.price - (req.body.price * (req.body.discount / 100))
            } else {
                req.body.finalPrice = req.body.price
            }
            const product = await create({
                model: productModel,
                data: req.body
            })
            return product ? res.status(201).json({ message: "Done", product }) :
                next(new Error('Fail to add new product', { cause: 400 }))
        }

    }
)


export const updateProduct = asyncHandler(
    async (req, res, next) => {

        const { id } = req.params;
        const { name, price, discount } = req.body
        const checkProduct = await findById({
            filter: id,
            model: productModel
        })
        if (!checkProduct) {
            return next(new Error("In-valid product", { cause: 404 }))
        }

        if (name) {
            const checkName = await findOne({
                model: productModel,
                filter: { name, _id: { $ne: id } }
            })
            if (checkName) {
                return next(new Error("Duplicate name", { cause: 409 }))
            }
            req.body.slug = slugify(name)
        }

        if (req.file) {
            const { secure_url, public_id } =
                await cloudinary.uploader.upload(req.file.path, { folder: `NFCard/Products` })
            req.body.image = secure_url;
            req.body.imagePublicId = public_id;
        }
        req.body.updateBy = req.user._id;

        req.body.createdBy = req.user._id;


        if (price & discount) {
            req.body.finalPrice = price - (price * (discount / 100))
        } else if (price) {
            req.body.finalPrice = price - (price * (checkProduct.discount / 100))
        } else if (discount) {
            req.body.finalPrice = checkProduct.price - (checkProduct.price * (discount / 100))
        }


        const product = await findByIdAndUpdate({
            model: productModel,
            filter: id,
            data: req.body,
            options: {
                new: false
            }
        })
        if (!product) {
            await cloudinary.uploader.destroy(req.body.imagePublicId)
            return next(new Error('Fail to add new product', { cause: 400 }))
        } else {
            await cloudinary.uploader.destroy(product.imagePublicId)
            return res.status(200).json({ message: "Done", product })
        }
    }
)



export const freezeProduct = asyncHandler(
    async (req, res, next) => {

        const { id } = req.params;
        const product = await findByIdAndUpdate({
            filter: id,
            model: productModel,
            data: {
                isDeleted: true,
                updateBy: req.user._id
            }
        })

        return product ? res.status(200).json({ message: "Done" })
            : next(new Error('Fail to freeze this product', { cause: 400 }))

    }

)

export const unFreezeProduct = asyncHandler(
    async (req, res, next) => {

        const { id } = req.params;
        const product = await findByIdAndUpdate({
            filter: id,
            model: productModel,
            data: {
                isDeleted: false,
                updateBy: req.user._id
            }
        })

        return product ? res.status(200).json({ message: "Done" })
            : next(new Error('Fail to freeze this product', { cause: 400 }))

    }

)



export const getProducts = asyncHandler(
    async (req, res, next) => {
        const products = await find({
            model: productModel,

        })
        return res.status(200).json({ message: "Done", products })
    }
)

export const geUsersProducts = asyncHandler(
    async (req, res, next) => {
        const products = await find({
            model: productModel,
            filter: {
                isDeleted: false
            },
            sort: [['createAt', "-1"]]

        })
        return res.status(200).json({ message: "Done", products })
    }
)

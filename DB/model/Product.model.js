import mongoose from "mongoose";
import { Schema, model, Types } from "mongoose";
const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'productName is required'],
        unique: [true, 'Duplicate productName'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']
    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        default: 1

    },
    discount: {
        type: Number,
        default: 0

    },
    finalPrice: {
        type: Number,
        default: 1

    },
    stock: {
        type: Number,
        default: 1,
        min: [0, "minimum Quantity 0"],

    },
    likes: {
        type: [{ type: Types.ObjectId, ref: 'User' }]
    },
    dislikes: {
        type: [{ type: Types.ObjectId, ref: 'User' }]
    },
    image: String,
    imagePublicId: String,
    createdBy: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    updateBy: {
        type: Types.ObjectId,
        ref: "User"

    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    wishUsers: [{ type: Types.ObjectId, ref: "User" }]
}, {
    timestamps: true
})


const productModel = mongoose.models.Product || model('Product', productSchema)
export default productModel
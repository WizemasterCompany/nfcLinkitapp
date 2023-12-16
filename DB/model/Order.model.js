
import mongoose from "mongoose";
import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema({

    userId: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    products: {
        type: [{
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                required: true,

            },
            unitPrice: {
                type: Number,
                default: 1,
                required: true,

            },
            totalPrice: {
                type: Number,
                required: true,
            }
        }]
    },
    address: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "Placed",
        enum: ["Placed", 'Rejected', 'On-way', 'Delivered' ,'Canceled'],
    },
    updatedBy: {
        type: Types.ObjectId,
        ref:"User"
    },
    reason: String
}, {
    timestamps: true
})


const orderModel = mongoose.models.Order || model('Order', orderSchema)
export default orderModel
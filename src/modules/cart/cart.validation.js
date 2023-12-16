import joi from "joi";

export const addToCart = {
    body: joi.object().required().keys({
        product:joi.object({
            productId:joi.string().min(24).max(24).required(),
            quantity:joi.number().integer().min(1).required()
        }).required()
    })
}


export const removeFromCart = {
    body: joi.object().required().keys({
        productId:joi.string().min(24).max(24).required()
    })
}
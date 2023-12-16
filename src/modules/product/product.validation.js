import joi from "joi";

export const addProduct = {
    body: joi.object().required().keys({
        name: joi.string().min(2).required(),
        price: joi.number().min(0).required(),
        discount: joi.number().integer().min(0).max(100),
        stock: joi.number().min(1).required(),
    })
}

export const updateProduct = {
    body: joi.object().required().keys({
        name: joi.string().min(2),
        price: joi.number().min(1),
        discount: joi.number().integer().min(0).max(100),
        stock: joi.number().min(1),
    }),
    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required()
    })
}
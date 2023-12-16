import joi from "joi";




export const dummyOrder = {
    body: joi.object().required().keys({
        products: joi.array().items(
            joi.object({
                productId: joi.string().min(24).max(24).required(),
                quantity: joi.number().min(1).integer().required(),
            })
        ).required()
    })
}



export const addOrder = {
    body: joi.object().required().keys({
        address: joi.string().min(1).required(),
        phone: joi.number().required(),
        products: joi.array().items(
            joi.object({
                productId: joi.string().min(24).max(24).required(),
                quantity: joi.number().min(1).integer().required(),
            })
        ).required()
    })
}


export const cancelOrder = {
    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required(),
    })
}


export const changeStatus = {
    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required(),
    }),
    body: joi.object().required().keys({
        status: joi.string().valid("Placed", 'Rejected', 'On-way', 'Delivered').required(),
        reason: joi.string()
    })
}


export const updateOrder = {
    body: joi.object().required().keys({
        name: joi.string().min(2),
        price: joi.number().min(1),
        stock: joi.number().min(1),
    })
}
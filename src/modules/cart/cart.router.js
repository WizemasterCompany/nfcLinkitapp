import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { endPoint } from "./cart.endPoint.js";
import * as cart from './controller/cart.js'
import * as validators from './cart.validation.js'
const router = Router()




router.post('/',
    validation(validators.addToCart),
    auth(endPoint.add),
    cart.addToCart)

router.put('/',
    validation(validators.removeFromCart),
    auth(endPoint.remove),
    cart.removeFromCart)
router.delete('/clear',
    auth(endPoint.remove),
    cart.clearCart)

router.get('/',
    auth(endPoint.getCart),
    cart.getCart)




export default router
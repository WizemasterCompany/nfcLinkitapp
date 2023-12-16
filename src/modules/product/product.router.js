import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./product.endPoint.js";
import * as product from './controller/product.js'
import * as validators from './product.validation.js'
import { validation } from "../../middleware/validation.js";
const router = Router({})


router.post('/',
    auth(endPoint.add),
    myMulter(fileValidation.image).single('image'),
    validation(validators.addProduct),
    product.createProduct)




router.put('/:id',
    auth(endPoint.update),
    myMulter(fileValidation.image).single('image'),
    validation(validators.updateProduct),
    product.updateProduct)


router.get('/:id/freeze',
    auth(endPoint.update),
    validation(validators.updateProduct),
    product.freezeProduct)


router.get('/:id/unFreeze',
    auth(endPoint.update),
    validation(validators.updateProduct),
    product.unFreezeProduct)


router.get("/", product.getProducts)
router.get("/client", product.geUsersProducts)



export default router
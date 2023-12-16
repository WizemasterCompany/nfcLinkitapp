import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./order.endPoint.js";
import * as order from './controller/order.js'
import * as validators from './order.validation.js'
import { validation } from "../../middleware/validation.js";
const router = Router({})


router.post(
    '/dummyOrder',
    auth(endPoint.addOrder),
    validation(validators.dummyOrder),
    order.createDummyOrder
)

router.post(
    '/',
    auth(endPoint.addOrder),
    validation(validators.addOrder),
    order.createOrder
)




router.patch(
    '/:id/changeState',
    auth(endPoint.changeReportState),
    validation(validators.changeStatus),
    order.changeReportState
)


router.get(
    '/placed',
    auth(endPoint.changeReportState),
    order.getPlacedOrders
)

router.get(
    '/',
    auth(endPoint.changeReportState),
    order.getAllOrders
)

router.get(
    '/user',
    auth(endPoint.cancelOrder),
    order.userOrders
)


router.get(
    '/:id/delete',
    auth(endPoint.cancelOrder),
    validation(validators.cancelOrder),
    order.cancelOrder
)


export default router
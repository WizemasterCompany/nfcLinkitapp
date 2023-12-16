import { roles } from "../../middleware/auth.js";

const endPoint = {
    addOrder: [roles.SuperAdmin, roles.Admin, roles.User],
    updateOrder: [roles.SuperAdmin, roles.Admin, roles.User],
    cancelOrder: [roles.User],
    changeReportState: [roles.SuperAdmin,roles.Admin]
}

export default endPoint
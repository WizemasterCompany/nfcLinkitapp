import { roles } from "../../middleware/auth.js";



export const endPoint = {
    add: [roles.SuperAdmin, roles.Admin, roles.User],
    getCart: [roles.SuperAdmin, roles.Admin, roles.User],
    remove: [roles.User],
}
import { roles } from "../../middleware/auth.js";




export const endPoint = {
    privileges: [roles.SuperAdmin],
    userList: [roles.SuperAdmin, roles.Admin],
    block: [roles.SuperAdmin],
    unblock: [roles.SuperAdmin],
    profile: [roles.SuperAdmin, roles.Admin, roles.User]
}
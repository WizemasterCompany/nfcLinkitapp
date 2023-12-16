import { roles } from "../../middleware/auth.js";



const endPoint = {
    add: [roles.SuperAdmin, roles.Admin],
    update: [roles.SuperAdmin, roles.Admin]
}

export default endPoint
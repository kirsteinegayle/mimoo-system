import VoucherController from './VoucherController'
import AdminController from './AdminController'
import AdminAccountController from './AdminAccountController'
import ReturnsController from './ReturnsController'
const Admin = {
    VoucherController: Object.assign(VoucherController, VoucherController),
AdminController: Object.assign(AdminController, AdminController),
AdminAccountController: Object.assign(AdminAccountController, AdminAccountController),
ReturnsController: Object.assign(ReturnsController, ReturnsController),
}

export default Admin
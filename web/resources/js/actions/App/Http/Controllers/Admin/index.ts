import VoucherController from './VoucherController'
import AdminController from './AdminController'
import ReturnsController from './ReturnsController'
const Admin = {
    VoucherController: Object.assign(VoucherController, VoucherController),
AdminController: Object.assign(AdminController, AdminController),
ReturnsController: Object.assign(ReturnsController, ReturnsController),
}

export default Admin
import VoucherController from './VoucherController'
import AdminController from './AdminController'
import BannerController from './BannerController'
import AdminReportsController from './AdminReportsController'
import UserAccountsController from './UserAccountsController'
import SellerComplianceController from './SellerComplianceController'
import ComplaintsController from './ComplaintsController'
import CommissionController from './CommissionController'
import PlatformSettingsController from './PlatformSettingsController'
import AdminAccountController from './AdminAccountController'
import ParcelReportsController from './ParcelReportsController'
import SupportTicketsController from './SupportTicketsController'
import ReturnsController from './ReturnsController'
const Admin = {
    VoucherController: Object.assign(VoucherController, VoucherController),
AdminController: Object.assign(AdminController, AdminController),
BannerController: Object.assign(BannerController, BannerController),
AdminReportsController: Object.assign(AdminReportsController, AdminReportsController),
UserAccountsController: Object.assign(UserAccountsController, UserAccountsController),
SellerComplianceController: Object.assign(SellerComplianceController, SellerComplianceController),
ComplaintsController: Object.assign(ComplaintsController, ComplaintsController),
CommissionController: Object.assign(CommissionController, CommissionController),
PlatformSettingsController: Object.assign(PlatformSettingsController, PlatformSettingsController),
AdminAccountController: Object.assign(AdminAccountController, AdminAccountController),
ParcelReportsController: Object.assign(ParcelReportsController, ParcelReportsController),
SupportTicketsController: Object.assign(SupportTicketsController, SupportTicketsController),
ReturnsController: Object.assign(ReturnsController, ReturnsController),
}

export default Admin
import Api from './Api'
import Buyer from './Buyer'
import SupportAttachmentController from './SupportAttachmentController'
import SupportTicketController from './SupportTicketController'
import PolicyController from './PolicyController'
import MessagingController from './MessagingController'
import Courier from './Courier'
import StaffSupportController from './StaffSupportController'
import SellerDashboardController from './SellerDashboardController'
import Logistics from './Logistics'
import RiderRegistrationController from './RiderRegistrationController'
import Auth from './Auth'
import OrderController from './OrderController'
import WaybillController from './WaybillController'
import ProductController from './ProductController'
import CartController from './CartController'
import WishlistController from './WishlistController'
import Admin from './Admin'
import Seller from './Seller'
import SellerAnalyticsController from './SellerAnalyticsController'
import SellerOrderController from './SellerOrderController'
import SellerDashboardStreamController from './SellerDashboardStreamController'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
Buyer: Object.assign(Buyer, Buyer),
SupportAttachmentController: Object.assign(SupportAttachmentController, SupportAttachmentController),
SupportTicketController: Object.assign(SupportTicketController, SupportTicketController),
PolicyController: Object.assign(PolicyController, PolicyController),
MessagingController: Object.assign(MessagingController, MessagingController),
Courier: Object.assign(Courier, Courier),
StaffSupportController: Object.assign(StaffSupportController, StaffSupportController),
SellerDashboardController: Object.assign(SellerDashboardController, SellerDashboardController),
Logistics: Object.assign(Logistics, Logistics),
RiderRegistrationController: Object.assign(RiderRegistrationController, RiderRegistrationController),
Auth: Object.assign(Auth, Auth),
OrderController: Object.assign(OrderController, OrderController),
WaybillController: Object.assign(WaybillController, WaybillController),
ProductController: Object.assign(ProductController, ProductController),
CartController: Object.assign(CartController, CartController),
WishlistController: Object.assign(WishlistController, WishlistController),
Admin: Object.assign(Admin, Admin),
Seller: Object.assign(Seller, Seller),
SellerAnalyticsController: Object.assign(SellerAnalyticsController, SellerAnalyticsController),
SellerOrderController: Object.assign(SellerOrderController, SellerOrderController),
SellerDashboardStreamController: Object.assign(SellerDashboardStreamController, SellerDashboardStreamController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers
import Api from './Api'
import SellerDashboardController from './SellerDashboardController'
import Courier from './Courier'
import RiderRegistrationController from './RiderRegistrationController'
import Auth from './Auth'
import OrderController from './OrderController'
import WaybillController from './WaybillController'
import ProductController from './ProductController'
import CartController from './CartController'
import WishlistController from './WishlistController'
import Admin from './Admin'
import Buyer from './Buyer'
import Seller from './Seller'
import SellerAnalyticsController from './SellerAnalyticsController'
import SellerOrderController from './SellerOrderController'
import SellerDashboardStreamController from './SellerDashboardStreamController'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
SellerDashboardController: Object.assign(SellerDashboardController, SellerDashboardController),
Courier: Object.assign(Courier, Courier),
RiderRegistrationController: Object.assign(RiderRegistrationController, RiderRegistrationController),
Auth: Object.assign(Auth, Auth),
OrderController: Object.assign(OrderController, OrderController),
WaybillController: Object.assign(WaybillController, WaybillController),
ProductController: Object.assign(ProductController, ProductController),
CartController: Object.assign(CartController, CartController),
WishlistController: Object.assign(WishlistController, WishlistController),
Admin: Object.assign(Admin, Admin),
Buyer: Object.assign(Buyer, Buyer),
Seller: Object.assign(Seller, Seller),
SellerAnalyticsController: Object.assign(SellerAnalyticsController, SellerAnalyticsController),
SellerOrderController: Object.assign(SellerOrderController, SellerOrderController),
SellerDashboardStreamController: Object.assign(SellerDashboardStreamController, SellerDashboardStreamController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers
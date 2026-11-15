import OrderTrackingController from './OrderTrackingController'
import MyReviewsController from './MyReviewsController'
import RefundStatusController from './RefundStatusController'
import NotificationController from './NotificationController'
const Buyer = {
    OrderTrackingController: Object.assign(OrderTrackingController, OrderTrackingController),
MyReviewsController: Object.assign(MyReviewsController, MyReviewsController),
RefundStatusController: Object.assign(RefundStatusController, RefundStatusController),
NotificationController: Object.assign(NotificationController, NotificationController),
}

export default Buyer
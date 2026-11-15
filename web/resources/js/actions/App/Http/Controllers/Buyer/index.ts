import OrderTrackingController from './OrderTrackingController'
import NotificationController from './NotificationController'
import RefundStatusController from './RefundStatusController'
import MyReviewsController from './MyReviewsController'
const Buyer = {
    OrderTrackingController: Object.assign(OrderTrackingController, OrderTrackingController),
NotificationController: Object.assign(NotificationController, NotificationController),
RefundStatusController: Object.assign(RefundStatusController, RefundStatusController),
MyReviewsController: Object.assign(MyReviewsController, MyReviewsController),
}

export default Buyer
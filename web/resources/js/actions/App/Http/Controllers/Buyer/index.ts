import OrderTrackingController from './OrderTrackingController'
import MyReviewsController from './MyReviewsController'
import RefundStatusController from './RefundStatusController'
import NotificationController from './NotificationController'
import ComplaintController from './ComplaintController'
const Buyer = {
    OrderTrackingController: Object.assign(OrderTrackingController, OrderTrackingController),
MyReviewsController: Object.assign(MyReviewsController, MyReviewsController),
RefundStatusController: Object.assign(RefundStatusController, RefundStatusController),
NotificationController: Object.assign(NotificationController, NotificationController),
ComplaintController: Object.assign(ComplaintController, ComplaintController),
}

export default Buyer
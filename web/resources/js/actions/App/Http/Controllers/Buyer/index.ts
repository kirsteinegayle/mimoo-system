import NotificationController from './NotificationController'
import RefundStatusController from './RefundStatusController'
import MyReviewsController from './MyReviewsController'
const Buyer = {
    NotificationController: Object.assign(NotificationController, NotificationController),
RefundStatusController: Object.assign(RefundStatusController, RefundStatusController),
MyReviewsController: Object.assign(MyReviewsController, MyReviewsController),
}

export default Buyer
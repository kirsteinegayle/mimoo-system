import NotificationController from './NotificationController'
import ReturnsController from './ReturnsController'
import ReviewsController from './ReviewsController'
const Seller = {
    NotificationController: Object.assign(NotificationController, NotificationController),
ReturnsController: Object.assign(ReturnsController, ReturnsController),
ReviewsController: Object.assign(ReviewsController, ReviewsController),
}

export default Seller
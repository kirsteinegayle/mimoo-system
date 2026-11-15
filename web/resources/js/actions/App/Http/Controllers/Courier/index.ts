import IncomingShipmentsController from './IncomingShipmentsController'
import NotificationController from './NotificationController'
import FacilityController from './FacilityController'
import RiderManagementController from './RiderManagementController'
import DeliveryManagementController from './DeliveryManagementController'
import CodRemittanceController from './CodRemittanceController'
const Courier = {
    IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
NotificationController: Object.assign(NotificationController, NotificationController),
FacilityController: Object.assign(FacilityController, FacilityController),
RiderManagementController: Object.assign(RiderManagementController, RiderManagementController),
DeliveryManagementController: Object.assign(DeliveryManagementController, DeliveryManagementController),
CodRemittanceController: Object.assign(CodRemittanceController, CodRemittanceController),
}

export default Courier
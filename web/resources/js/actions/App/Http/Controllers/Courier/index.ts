import IncomingShipmentsController from './IncomingShipmentsController'
import PickupManagementController from './PickupManagementController'
import NotificationController from './NotificationController'
import FacilityController from './FacilityController'
import RiderManagementController from './RiderManagementController'
import DeliveryManagementController from './DeliveryManagementController'
import CodRemittanceController from './CodRemittanceController'
const Courier = {
    IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
PickupManagementController: Object.assign(PickupManagementController, PickupManagementController),
NotificationController: Object.assign(NotificationController, NotificationController),
FacilityController: Object.assign(FacilityController, FacilityController),
RiderManagementController: Object.assign(RiderManagementController, RiderManagementController),
DeliveryManagementController: Object.assign(DeliveryManagementController, DeliveryManagementController),
CodRemittanceController: Object.assign(CodRemittanceController, CodRemittanceController),
}

export default Courier
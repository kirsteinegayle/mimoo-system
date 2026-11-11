import IncomingShipmentsController from './IncomingShipmentsController'
import PickupManagementController from './PickupManagementController'
import FacilityController from './FacilityController'
import RiderManagementController from './RiderManagementController'
import DeliveryManagementController from './DeliveryManagementController'
const Courier = {
    IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
PickupManagementController: Object.assign(PickupManagementController, PickupManagementController),
FacilityController: Object.assign(FacilityController, FacilityController),
RiderManagementController: Object.assign(RiderManagementController, RiderManagementController),
DeliveryManagementController: Object.assign(DeliveryManagementController, DeliveryManagementController),
}

export default Courier
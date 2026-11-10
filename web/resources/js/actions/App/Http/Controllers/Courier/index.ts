import IncomingShipmentsController from './IncomingShipmentsController'
import PickupManagementController from './PickupManagementController'
import FacilityController from './FacilityController'
import RiderManagementController from './RiderManagementController'
const Courier = {
    IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
PickupManagementController: Object.assign(PickupManagementController, PickupManagementController),
FacilityController: Object.assign(FacilityController, FacilityController),
RiderManagementController: Object.assign(RiderManagementController, RiderManagementController),
}

export default Courier
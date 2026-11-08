import IncomingShipmentsController from './IncomingShipmentsController'
import PickupManagementController from './PickupManagementController'
import FacilityController from './FacilityController'
const Courier = {
    IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
PickupManagementController: Object.assign(PickupManagementController, PickupManagementController),
FacilityController: Object.assign(FacilityController, FacilityController),
}

export default Courier
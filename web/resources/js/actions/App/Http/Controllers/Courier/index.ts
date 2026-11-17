import CodRemittanceController from './CodRemittanceController'
import TransferController from './TransferController'
import CompanySettingsController from './CompanySettingsController'
import IncomingShipmentsController from './IncomingShipmentsController'
import NotificationController from './NotificationController'
import FacilityController from './FacilityController'
import RiderManagementController from './RiderManagementController'
import DeliveryManagementController from './DeliveryManagementController'
const Courier = {
    CodRemittanceController: Object.assign(CodRemittanceController, CodRemittanceController),
TransferController: Object.assign(TransferController, TransferController),
CompanySettingsController: Object.assign(CompanySettingsController, CompanySettingsController),
IncomingShipmentsController: Object.assign(IncomingShipmentsController, IncomingShipmentsController),
NotificationController: Object.assign(NotificationController, NotificationController),
FacilityController: Object.assign(FacilityController, FacilityController),
RiderManagementController: Object.assign(RiderManagementController, RiderManagementController),
DeliveryManagementController: Object.assign(DeliveryManagementController, DeliveryManagementController),
}

export default Courier
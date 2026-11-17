import DashboardController from './DashboardController'
import OperationsController from './OperationsController'
import FacilityChecklistController from './FacilityChecklistController'
import ZonesRatesController from './ZonesRatesController'
import CodSettlementController from './CodSettlementController'
const Logistics = {
    DashboardController: Object.assign(DashboardController, DashboardController),
OperationsController: Object.assign(OperationsController, OperationsController),
FacilityChecklistController: Object.assign(FacilityChecklistController, FacilityChecklistController),
ZonesRatesController: Object.assign(ZonesRatesController, ZonesRatesController),
CodSettlementController: Object.assign(CodSettlementController, CodSettlementController),
}

export default Logistics
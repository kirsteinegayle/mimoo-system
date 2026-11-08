import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import facility from './facility'
/**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/courier/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:83
 * @route '/courier/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
export const incomingShipments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incomingShipments.url(options),
    method: 'get',
})

incomingShipments.definition = {
    methods: ["get","head"],
    url: '/courier/incoming-shipments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
incomingShipments.url = (options?: RouteQueryOptions) => {
    return incomingShipments.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
incomingShipments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incomingShipments.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
incomingShipments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: incomingShipments.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
    const incomingShipmentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: incomingShipments.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
        incomingShipmentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: incomingShipments.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\IncomingShipmentsController::incomingShipments
 * @see app/Http/Controllers/Courier/IncomingShipmentsController.php:17
 * @route '/courier/incoming-shipments'
 */
        incomingShipmentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: incomingShipments.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    incomingShipments.form = incomingShipmentsForm
/**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
export const pickupManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pickupManagement.url(options),
    method: 'get',
})

pickupManagement.definition = {
    methods: ["get","head"],
    url: '/courier/pickup-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
pickupManagement.url = (options?: RouteQueryOptions) => {
    return pickupManagement.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
pickupManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pickupManagement.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
pickupManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pickupManagement.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
    const pickupManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pickupManagement.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
        pickupManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pickupManagement.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\PickupManagementController::pickupManagement
 * @see app/Http/Controllers/Courier/PickupManagementController.php:18
 * @route '/courier/pickup-management'
 */
        pickupManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pickupManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pickupManagement.form = pickupManagementForm
/**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
export const parcelScanning = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parcelScanning.url(options),
    method: 'get',
})

parcelScanning.definition = {
    methods: ["get","head"],
    url: '/courier/parcel-scanning',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
parcelScanning.url = (options?: RouteQueryOptions) => {
    return parcelScanning.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
parcelScanning.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: parcelScanning.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
parcelScanning.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: parcelScanning.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
    const parcelScanningForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: parcelScanning.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
        parcelScanningForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parcelScanning.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:154
 * @route '/courier/parcel-scanning'
 */
        parcelScanningForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: parcelScanning.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    parcelScanning.form = parcelScanningForm
/**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
export const sortingTransfers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sortingTransfers.url(options),
    method: 'get',
})

sortingTransfers.definition = {
    methods: ["get","head"],
    url: '/courier/sorting-transfers',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
sortingTransfers.url = (options?: RouteQueryOptions) => {
    return sortingTransfers.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
sortingTransfers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sortingTransfers.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
sortingTransfers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sortingTransfers.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
    const sortingTransfersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sortingTransfers.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
        sortingTransfersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sortingTransfers.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:138
 * @route '/courier/sorting-transfers'
 */
        sortingTransfersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sortingTransfers.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sortingTransfers.form = sortingTransfersForm
/**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
export const branchFacility = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branchFacility.url(options),
    method: 'get',
})

branchFacility.definition = {
    methods: ["get","head"],
    url: '/courier/branch-facility',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
branchFacility.url = (options?: RouteQueryOptions) => {
    return branchFacility.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
branchFacility.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branchFacility.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
branchFacility.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branchFacility.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
    const branchFacilityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: branchFacility.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
        branchFacilityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branchFacility.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\FacilityController::branchFacility
 * @see app/Http/Controllers/Courier/FacilityController.php:17
 * @route '/courier/branch-facility'
 */
        branchFacilityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branchFacility.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    branchFacility.form = branchFacilityForm
/**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
export const riderManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riderManagement.url(options),
    method: 'get',
})

riderManagement.definition = {
    methods: ["get","head"],
    url: '/courier/rider-management',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
riderManagement.url = (options?: RouteQueryOptions) => {
    return riderManagement.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
riderManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riderManagement.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
riderManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riderManagement.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
    const riderManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riderManagement.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
        riderManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riderManagement.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:421
 * @route '/courier/rider-management'
 */
        riderManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riderManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    riderManagement.form = riderManagementForm
/**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
export const deliveryManagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryManagement.url(options),
    method: 'get',
})

deliveryManagement.definition = {
    methods: ["get","head"],
    url: '/courier/delivery-management',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
deliveryManagement.url = (options?: RouteQueryOptions) => {
    return deliveryManagement.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
deliveryManagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryManagement.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
deliveryManagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deliveryManagement.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
    const deliveryManagementForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deliveryManagement.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
        deliveryManagementForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveryManagement.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:430
 * @route '/courier/delivery-management'
 */
        deliveryManagementForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveryManagement.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deliveryManagement.form = deliveryManagementForm
/**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
export const codRemittance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: codRemittance.url(options),
    method: 'get',
})

codRemittance.definition = {
    methods: ["get","head"],
    url: '/courier/cod-remittance',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
codRemittance.url = (options?: RouteQueryOptions) => {
    return codRemittance.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
codRemittance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: codRemittance.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
codRemittance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: codRemittance.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
    const codRemittanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: codRemittance.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
        codRemittanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: codRemittance.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:439
 * @route '/courier/cod-remittance'
 */
        codRemittanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: codRemittance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    codRemittance.form = codRemittanceForm
/**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/courier/reports',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:448
 * @route '/courier/reports'
 */
        reportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reports.form = reportsForm
/**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
export const support = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})

support.definition = {
    methods: ["get","head"],
    url: '/courier/support',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
support.url = (options?: RouteQueryOptions) => {
    return support.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
support.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
support.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: support.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
    const supportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: support.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
        supportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: support.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:457
 * @route '/courier/support'
 */
        supportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: support.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    support.form = supportForm
/**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
export const messages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/courier/messages',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
messages.url = (options?: RouteQueryOptions) => {
    return messages.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
messages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
messages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
    const messagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
        messagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:466
 * @route '/courier/messages'
 */
        messagesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages.form = messagesForm
/**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/courier/settings',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
    const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settings.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
        settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:475
 * @route '/courier/settings'
 */
        settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    settings.form = settingsForm
const courier = {
    dashboard: Object.assign(dashboard, dashboard),
incomingShipments: Object.assign(incomingShipments, incomingShipments),
pickupManagement: Object.assign(pickupManagement, pickupManagement),
parcelScanning: Object.assign(parcelScanning, parcelScanning),
sortingTransfers: Object.assign(sortingTransfers, sortingTransfers),
branchFacility: Object.assign(branchFacility, branchFacility),
facility: Object.assign(facility, facility),
riderManagement: Object.assign(riderManagement, riderManagement),
deliveryManagement: Object.assign(deliveryManagement, deliveryManagement),
codRemittance: Object.assign(codRemittance, codRemittance),
reports: Object.assign(reports, reports),
support: Object.assign(support, support),
messages: Object.assign(messages, messages),
settings: Object.assign(settings, settings),
}

export default courier
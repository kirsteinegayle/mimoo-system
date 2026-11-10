import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
 * @see routes/web.php:23
 * @route '/logistics'
 */
export const landing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})

landing.definition = {
    methods: ["get","head"],
    url: '/logistics',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:23
 * @route '/logistics'
 */
landing.url = (options?: RouteQueryOptions) => {
    return landing.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:23
 * @route '/logistics'
 */
landing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:23
 * @route '/logistics'
 */
landing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: landing.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:23
 * @route '/logistics'
 */
    const landingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: landing.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:23
 * @route '/logistics'
 */
        landingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:23
 * @route '/logistics'
 */
        landingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: landing.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    landing.form = landingForm
/**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/logistics/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:63
 * @route '/logistics/dashboard'
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
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
export const incomingParcels = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incomingParcels.url(options),
    method: 'get',
})

incomingParcels.definition = {
    methods: ["get","head"],
    url: '/logistics/incoming-parcels',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
incomingParcels.url = (options?: RouteQueryOptions) => {
    return incomingParcels.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
incomingParcels.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: incomingParcels.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
incomingParcels.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: incomingParcels.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
    const incomingParcelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: incomingParcels.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
        incomingParcelsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: incomingParcels.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:480
 * @route '/logistics/incoming-parcels'
 */
        incomingParcelsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: incomingParcels.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    incomingParcels.form = incomingParcelsForm
/**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
export const courierApplications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: courierApplications.url(options),
    method: 'get',
})

courierApplications.definition = {
    methods: ["get","head"],
    url: '/logistics/courier-applications',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
courierApplications.url = (options?: RouteQueryOptions) => {
    return courierApplications.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
courierApplications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: courierApplications.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
courierApplications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: courierApplications.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
    const courierApplicationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: courierApplications.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
        courierApplicationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: courierApplications.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:726
 * @route '/logistics/courier-applications'
 */
        courierApplicationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: courierApplications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    courierApplications.form = courierApplicationsForm
/**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
export const courierApplicationDetail = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: courierApplicationDetail.url(args, options),
    method: 'get',
})

courierApplicationDetail.definition = {
    methods: ["get","head"],
    url: '/logistics/courier-applications/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
courierApplicationDetail.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return courierApplicationDetail.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
courierApplicationDetail.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: courierApplicationDetail.url(args, options),
    method: 'get',
})
/**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
courierApplicationDetail.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: courierApplicationDetail.url(args, options),
    method: 'head',
})

    /**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
    const courierApplicationDetailForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: courierApplicationDetail.url(args, options),
        method: 'get',
    })

            /**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
        courierApplicationDetailForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: courierApplicationDetail.url(args, options),
            method: 'get',
        })
            /**
 * @see routes/web.php:774
 * @route '/logistics/courier-applications/{id}'
 */
        courierApplicationDetailForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: courierApplicationDetail.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    courierApplicationDetail.form = courierApplicationDetailForm
/**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
export const sortAssign = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sortAssign.url(options),
    method: 'get',
})

sortAssign.definition = {
    methods: ["get","head"],
    url: '/logistics/sort-assign',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
sortAssign.url = (options?: RouteQueryOptions) => {
    return sortAssign.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
sortAssign.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sortAssign.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
sortAssign.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sortAssign.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
    const sortAssignForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: sortAssign.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
        sortAssignForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sortAssign.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:959
 * @route '/logistics/sort-assign'
 */
        sortAssignForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: sortAssign.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    sortAssign.form = sortAssignForm
/**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
export const deliveryMonitoring = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryMonitoring.url(options),
    method: 'get',
})

deliveryMonitoring.definition = {
    methods: ["get","head"],
    url: '/logistics/delivery-monitoring',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
deliveryMonitoring.url = (options?: RouteQueryOptions) => {
    return deliveryMonitoring.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
deliveryMonitoring.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryMonitoring.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
deliveryMonitoring.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deliveryMonitoring.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
    const deliveryMonitoringForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deliveryMonitoring.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
        deliveryMonitoringForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveryMonitoring.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1211
 * @route '/logistics/delivery-monitoring'
 */
        deliveryMonitoringForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveryMonitoring.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deliveryMonitoring.form = deliveryMonitoringForm
/**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
export const riders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})

riders.definition = {
    methods: ["get","head"],
    url: '/logistics/riders',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
riders.url = (options?: RouteQueryOptions) => {
    return riders.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
riders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
riders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riders.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
    const ridersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riders.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
        ridersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1231
 * @route '/logistics/riders'
 */
        ridersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    riders.form = ridersForm
/**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
export const branchesChecklists = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branchesChecklists.url(options),
    method: 'get',
})

branchesChecklists.definition = {
    methods: ["get","head"],
    url: '/logistics/branches-checklists',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
branchesChecklists.url = (options?: RouteQueryOptions) => {
    return branchesChecklists.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
branchesChecklists.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branchesChecklists.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
branchesChecklists.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branchesChecklists.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
    const branchesChecklistsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: branchesChecklists.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
        branchesChecklistsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branchesChecklists.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1251
 * @route '/logistics/branches-checklists'
 */
        branchesChecklistsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branchesChecklists.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    branchesChecklists.form = branchesChecklistsForm
/**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
export const zonesRates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: zonesRates.url(options),
    method: 'get',
})

zonesRates.definition = {
    methods: ["get","head"],
    url: '/logistics/zones-rates',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
zonesRates.url = (options?: RouteQueryOptions) => {
    return zonesRates.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
zonesRates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: zonesRates.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
zonesRates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: zonesRates.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
    const zonesRatesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: zonesRates.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
        zonesRatesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: zonesRates.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1271
 * @route '/logistics/zones-rates'
 */
        zonesRatesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: zonesRates.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    zonesRates.form = zonesRatesForm
/**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
export const codRemittance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: codRemittance.url(options),
    method: 'get',
})

codRemittance.definition = {
    methods: ["get","head"],
    url: '/logistics/cod-remittance',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
codRemittance.url = (options?: RouteQueryOptions) => {
    return codRemittance.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
codRemittance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: codRemittance.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
codRemittance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: codRemittance.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
    const codRemittanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: codRemittance.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
 */
        codRemittanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: codRemittance.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1291
 * @route '/logistics/cod-remittance'
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
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/logistics/reports',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1311
 * @route '/logistics/reports'
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
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
export const support = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})

support.definition = {
    methods: ["get","head"],
    url: '/logistics/support',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
support.url = (options?: RouteQueryOptions) => {
    return support.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
support.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
support.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: support.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
    const supportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: support.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1331
 * @route '/logistics/support'
 */
        supportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: support.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1331
 * @route '/logistics/support'
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
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
export const messages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/logistics/messages',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
messages.url = (options?: RouteQueryOptions) => {
    return messages.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
messages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
messages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
    const messagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
 */
        messagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1351
 * @route '/logistics/messages'
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
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
export const account = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(options),
    method: 'get',
})

account.definition = {
    methods: ["get","head"],
    url: '/logistics/account',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
account.url = (options?: RouteQueryOptions) => {
    return account.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
account.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: account.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
account.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: account.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
    const accountForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: account.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
        accountForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1371
 * @route '/logistics/account'
 */
        accountForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: account.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    account.form = accountForm
/**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
export const pendingApproval = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})

pendingApproval.definition = {
    methods: ["get","head"],
    url: '/logistics/pending-approval',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
pendingApproval.url = (options?: RouteQueryOptions) => {
    return pendingApproval.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
pendingApproval.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pendingApproval.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
pendingApproval.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pendingApproval.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
    const pendingApprovalForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pendingApproval.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
        pendingApprovalForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pendingApproval.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:1580
 * @route '/logistics/pending-approval'
 */
        pendingApprovalForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pendingApproval.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pendingApproval.form = pendingApprovalForm
const logistics = {
    landing: Object.assign(landing, landing),
dashboard: Object.assign(dashboard, dashboard),
incomingParcels: Object.assign(incomingParcels, incomingParcels),
courierApplications: Object.assign(courierApplications, courierApplications),
courierApplicationDetail: Object.assign(courierApplicationDetail, courierApplicationDetail),
sortAssign: Object.assign(sortAssign, sortAssign),
deliveryMonitoring: Object.assign(deliveryMonitoring, deliveryMonitoring),
riders: Object.assign(riders, riders),
branchesChecklists: Object.assign(branchesChecklists, branchesChecklists),
zonesRates: Object.assign(zonesRates, zonesRates),
codRemittance: Object.assign(codRemittance, codRemittance),
reports: Object.assign(reports, reports),
support: Object.assign(support, support),
messages: Object.assign(messages, messages),
account: Object.assign(account, account),
pendingApproval: Object.assign(pendingApproval, pendingApproval),
}

export default logistics
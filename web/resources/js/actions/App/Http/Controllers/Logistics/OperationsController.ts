import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
export const monitoring = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitoring.url(options),
    method: 'get',
})

monitoring.definition = {
    methods: ["get","head"],
    url: '/logistics/monitoring-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
monitoring.url = (options?: RouteQueryOptions) => {
    return monitoring.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
monitoring.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitoring.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
monitoring.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: monitoring.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
    const monitoringForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: monitoring.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
        monitoringForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: monitoring.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\OperationsController::monitoring
 * @see app/Http/Controllers/Logistics/OperationsController.php:54
 * @route '/logistics/monitoring-data'
 */
        monitoringForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: monitoring.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    monitoring.form = monitoringForm
/**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
export const riders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})

riders.definition = {
    methods: ["get","head"],
    url: '/logistics/riders-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
riders.url = (options?: RouteQueryOptions) => {
    return riders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
riders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riders.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
riders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riders.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
    const ridersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riders.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
 */
        ridersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riders.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\OperationsController::riders
 * @see app/Http/Controllers/Logistics/OperationsController.php:111
 * @route '/logistics/riders-data'
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
* @see \App\Http\Controllers\Logistics\OperationsController::storeRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:128
 * @route '/logistics/riders'
 */
export const storeRider = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRider.url(options),
    method: 'post',
})

storeRider.definition = {
    methods: ["post"],
    url: '/logistics/riders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Logistics\OperationsController::storeRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:128
 * @route '/logistics/riders'
 */
storeRider.url = (options?: RouteQueryOptions) => {
    return storeRider.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\OperationsController::storeRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:128
 * @route '/logistics/riders'
 */
storeRider.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRider.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Logistics\OperationsController::storeRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:128
 * @route '/logistics/riders'
 */
    const storeRiderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeRider.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\OperationsController::storeRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:128
 * @route '/logistics/riders'
 */
        storeRiderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeRider.url(options),
            method: 'post',
        })
    
    storeRider.form = storeRiderForm
/**
* @see \App\Http\Controllers\Logistics\OperationsController::updateRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:157
 * @route '/logistics/riders/{id}'
 */
export const updateRider = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRider.url(args, options),
    method: 'put',
})

updateRider.definition = {
    methods: ["put"],
    url: '/logistics/riders/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Logistics\OperationsController::updateRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:157
 * @route '/logistics/riders/{id}'
 */
updateRider.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateRider.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\OperationsController::updateRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:157
 * @route '/logistics/riders/{id}'
 */
updateRider.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRider.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Logistics\OperationsController::updateRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:157
 * @route '/logistics/riders/{id}'
 */
    const updateRiderForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateRider.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Logistics\OperationsController::updateRider
 * @see app/Http/Controllers/Logistics/OperationsController.php:157
 * @route '/logistics/riders/{id}'
 */
        updateRiderForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateRider.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateRider.form = updateRiderForm
/**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/logistics/reports-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
    const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reports.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
 */
        reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reports.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Logistics\OperationsController::reports
 * @see app/Http/Controllers/Logistics/OperationsController.php:183
 * @route '/logistics/reports-data'
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
const OperationsController = { monitoring, riders, storeRider, updateRider, reports }

export default OperationsController
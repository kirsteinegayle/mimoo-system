import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
export const facilities = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: facilities.url(options),
    method: 'get',
})

facilities.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/facilities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
facilities.url = (options?: RouteQueryOptions) => {
    return facilities.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
facilities.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: facilities.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
facilities.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: facilities.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
    const facilitiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: facilities.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
        facilitiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: facilities.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierScanController::facilities
 * @see app/Http/Controllers/Api/CourierScanController.php:18
 * @route '/api/courier-app/facilities'
 */
        facilitiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: facilities.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    facilities.form = facilitiesForm
/**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
export const show = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/parcel/{waybill}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
show.url = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { waybill: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    waybill: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        waybill: args.waybill,
                }

    return show.definition.url
            .replace('{waybill}', parsedArgs.waybill.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
show.get = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
show.head = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
    const showForm = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
        showForm.get = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CourierScanController::show
 * @see app/Http/Controllers/Api/CourierScanController.php:71
 * @route '/api/courier-app/parcel/{waybill}'
 */
        showForm.head = (args: { waybill: string | number } | [waybill: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\CourierScanController::scan
 * @see app/Http/Controllers/Api/CourierScanController.php:136
 * @route '/api/courier-app/scan-parcel'
 */
export const scan = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scan.url(options),
    method: 'post',
})

scan.definition = {
    methods: ["post"],
    url: '/api/courier-app/scan-parcel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CourierScanController::scan
 * @see app/Http/Controllers/Api/CourierScanController.php:136
 * @route '/api/courier-app/scan-parcel'
 */
scan.url = (options?: RouteQueryOptions) => {
    return scan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CourierScanController::scan
 * @see app/Http/Controllers/Api/CourierScanController.php:136
 * @route '/api/courier-app/scan-parcel'
 */
scan.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scan.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CourierScanController::scan
 * @see app/Http/Controllers/Api/CourierScanController.php:136
 * @route '/api/courier-app/scan-parcel'
 */
    const scanForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: scan.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CourierScanController::scan
 * @see app/Http/Controllers/Api/CourierScanController.php:136
 * @route '/api/courier-app/scan-parcel'
 */
        scanForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: scan.url(options),
            method: 'post',
        })
    
    scan.form = scanForm
const CourierScanController = { facilities, show, scan }

export default CourierScanController
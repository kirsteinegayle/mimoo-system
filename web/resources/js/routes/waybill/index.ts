import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
export const qr = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qr.url(args, options),
    method: 'get',
})

qr.definition = {
    methods: ["get","head"],
    url: '/waybill/{waybillNumber}/qr',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qr.url = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { waybillNumber: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    waybillNumber: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        waybillNumber: args.waybillNumber,
                }

    return qr.definition.url
            .replace('{waybillNumber}', parsedArgs.waybillNumber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qr.get = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qr.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qr.head = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: qr.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
    const qrForm = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: qr.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
        qrForm.get = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qr.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WaybillController::qr
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
        qrForm.head = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qr.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    qr.form = qrForm
const waybill = {
    qr: Object.assign(qr, qr),
}

export default waybill
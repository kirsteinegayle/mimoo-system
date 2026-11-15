import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
export const qrCode = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(args, options),
    method: 'get',
})

qrCode.definition = {
    methods: ["get","head"],
    url: '/waybill/{waybillNumber}/qr',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qrCode.url = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return qrCode.definition.url
            .replace('{waybillNumber}', parsedArgs.waybillNumber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qrCode.get = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
qrCode.head = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: qrCode.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
    const qrCodeForm = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: qrCode.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
        qrCodeForm.get = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qrCode.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WaybillController::qrCode
 * @see app/Http/Controllers/WaybillController.php:156
 * @route '/waybill/{waybillNumber}/qr'
 */
        qrCodeForm.head = (args: { waybillNumber: string | number } | [waybillNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: qrCode.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    qrCode.form = qrCodeForm
/**
* @see \App\Http\Controllers\WaybillController::generate
 * @see app/Http/Controllers/WaybillController.php:17
 * @route '/api/orders/{id}/waybill/generate'
 */
export const generate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(args, options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/orders/{id}/waybill/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WaybillController::generate
 * @see app/Http/Controllers/WaybillController.php:17
 * @route '/api/orders/{id}/waybill/generate'
 */
generate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return generate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WaybillController::generate
 * @see app/Http/Controllers/WaybillController.php:17
 * @route '/api/orders/{id}/waybill/generate'
 */
generate.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WaybillController::generate
 * @see app/Http/Controllers/WaybillController.php:17
 * @route '/api/orders/{id}/waybill/generate'
 */
    const generateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: generate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WaybillController::generate
 * @see app/Http/Controllers/WaybillController.php:17
 * @route '/api/orders/{id}/waybill/generate'
 */
        generateForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: generate.url(args, options),
            method: 'post',
        })
    
    generate.form = generateForm
/**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/orders/{id}/waybill',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WaybillController::show
 * @see app/Http/Controllers/WaybillController.php:60
 * @route '/api/orders/{id}/waybill'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\WaybillController::markPrinted
 * @see app/Http/Controllers/WaybillController.php:122
 * @route '/api/orders/{id}/waybill/mark-printed'
 */
export const markPrinted = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPrinted.url(args, options),
    method: 'post',
})

markPrinted.definition = {
    methods: ["post"],
    url: '/api/orders/{id}/waybill/mark-printed',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WaybillController::markPrinted
 * @see app/Http/Controllers/WaybillController.php:122
 * @route '/api/orders/{id}/waybill/mark-printed'
 */
markPrinted.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markPrinted.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WaybillController::markPrinted
 * @see app/Http/Controllers/WaybillController.php:122
 * @route '/api/orders/{id}/waybill/mark-printed'
 */
markPrinted.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPrinted.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WaybillController::markPrinted
 * @see app/Http/Controllers/WaybillController.php:122
 * @route '/api/orders/{id}/waybill/mark-printed'
 */
    const markPrintedForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markPrinted.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WaybillController::markPrinted
 * @see app/Http/Controllers/WaybillController.php:122
 * @route '/api/orders/{id}/waybill/mark-printed'
 */
        markPrintedForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markPrinted.url(args, options),
            method: 'post',
        })
    
    markPrinted.form = markPrintedForm
const WaybillController = { qrCode, generate, show, markPrinted }

export default WaybillController
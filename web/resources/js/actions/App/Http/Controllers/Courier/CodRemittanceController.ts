import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
const index695dd9efd3c2bc720d2d25913bf4f6dc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index695dd9efd3c2bc720d2d25913bf4f6dc.url(options),
    method: 'get',
})

index695dd9efd3c2bc720d2d25913bf4f6dc.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/cod-remittances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
index695dd9efd3c2bc720d2d25913bf4f6dc.url = (options?: RouteQueryOptions) => {
    return index695dd9efd3c2bc720d2d25913bf4f6dc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
index695dd9efd3c2bc720d2d25913bf4f6dc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index695dd9efd3c2bc720d2d25913bf4f6dc.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
index695dd9efd3c2bc720d2d25913bf4f6dc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index695dd9efd3c2bc720d2d25913bf4f6dc.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
    const index695dd9efd3c2bc720d2d25913bf4f6dcForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index695dd9efd3c2bc720d2d25913bf4f6dc.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
        index695dd9efd3c2bc720d2d25913bf4f6dcForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index695dd9efd3c2bc720d2d25913bf4f6dc.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/api/courier-app/cod-remittances'
 */
        index695dd9efd3c2bc720d2d25913bf4f6dcForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index695dd9efd3c2bc720d2d25913bf4f6dc.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index695dd9efd3c2bc720d2d25913bf4f6dc.form = index695dd9efd3c2bc720d2d25913bf4f6dcForm
    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
const index80ad2a206e926db84710fe3bf22098f8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index80ad2a206e926db84710fe3bf22098f8.url(options),
    method: 'get',
})

index80ad2a206e926db84710fe3bf22098f8.definition = {
    methods: ["get","head"],
    url: '/courier/cod-remittances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index80ad2a206e926db84710fe3bf22098f8.url = (options?: RouteQueryOptions) => {
    return index80ad2a206e926db84710fe3bf22098f8.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index80ad2a206e926db84710fe3bf22098f8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index80ad2a206e926db84710fe3bf22098f8.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
index80ad2a206e926db84710fe3bf22098f8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index80ad2a206e926db84710fe3bf22098f8.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
    const index80ad2a206e926db84710fe3bf22098f8Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index80ad2a206e926db84710fe3bf22098f8.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
        index80ad2a206e926db84710fe3bf22098f8Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index80ad2a206e926db84710fe3bf22098f8.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::index
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:48
 * @route '/courier/cod-remittances'
 */
        index80ad2a206e926db84710fe3bf22098f8Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index80ad2a206e926db84710fe3bf22098f8.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index80ad2a206e926db84710fe3bf22098f8.form = index80ad2a206e926db84710fe3bf22098f8Form

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\CodRemittanceController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/courier-app/cod-remittances': index695dd9efd3c2bc720d2d25913bf4f6dc,
    '/courier/cod-remittances': index80ad2a206e926db84710fe3bf22098f8,
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/api/courier-app/cod-remittances/{id}/confirm'
 */
const confirma80095fed4066f3a01dac0dda5a1ac7d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirma80095fed4066f3a01dac0dda5a1ac7d.url(args, options),
    method: 'post',
})

confirma80095fed4066f3a01dac0dda5a1ac7d.definition = {
    methods: ["post"],
    url: '/api/courier-app/cod-remittances/{id}/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/api/courier-app/cod-remittances/{id}/confirm'
 */
confirma80095fed4066f3a01dac0dda5a1ac7d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return confirma80095fed4066f3a01dac0dda5a1ac7d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/api/courier-app/cod-remittances/{id}/confirm'
 */
confirma80095fed4066f3a01dac0dda5a1ac7d.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirma80095fed4066f3a01dac0dda5a1ac7d.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/api/courier-app/cod-remittances/{id}/confirm'
 */
    const confirma80095fed4066f3a01dac0dda5a1ac7dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: confirma80095fed4066f3a01dac0dda5a1ac7d.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/api/courier-app/cod-remittances/{id}/confirm'
 */
        confirma80095fed4066f3a01dac0dda5a1ac7dForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: confirma80095fed4066f3a01dac0dda5a1ac7d.url(args, options),
            method: 'post',
        })
    
    confirma80095fed4066f3a01dac0dda5a1ac7d.form = confirma80095fed4066f3a01dac0dda5a1ac7dForm
    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
const confirmafeca151989418bb9f59bc6d9bcf4817 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmafeca151989418bb9f59bc6d9bcf4817.url(args, options),
    method: 'post',
})

confirmafeca151989418bb9f59bc6d9bcf4817.definition = {
    methods: ["post"],
    url: '/courier/cod-remittances/{id}/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
confirmafeca151989418bb9f59bc6d9bcf4817.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return confirmafeca151989418bb9f59bc6d9bcf4817.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
confirmafeca151989418bb9f59bc6d9bcf4817.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmafeca151989418bb9f59bc6d9bcf4817.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
    const confirmafeca151989418bb9f59bc6d9bcf4817Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: confirmafeca151989418bb9f59bc6d9bcf4817.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\CodRemittanceController::confirm
 * @see app/Http/Controllers/Courier/CodRemittanceController.php:68
 * @route '/courier/cod-remittances/{id}/confirm'
 */
        confirmafeca151989418bb9f59bc6d9bcf4817Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: confirmafeca151989418bb9f59bc6d9bcf4817.url(args, options),
            method: 'post',
        })
    
    confirmafeca151989418bb9f59bc6d9bcf4817.form = confirmafeca151989418bb9f59bc6d9bcf4817Form

/**
* Multiple routes resolve to \App\Http\Controllers\Courier\CodRemittanceController::confirm, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `confirm['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const confirm = {
    '/api/courier-app/cod-remittances/{id}/confirm': confirma80095fed4066f3a01dac0dda5a1ac7d,
    '/courier/cod-remittances/{id}/confirm': confirmafeca151989418bb9f59bc6d9bcf4817,
}

const CodRemittanceController = { index, confirm }

export default CodRemittanceController
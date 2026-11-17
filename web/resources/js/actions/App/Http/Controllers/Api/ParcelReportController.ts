import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
const buyerShowc262e3fe259ba933a181c4c64c20bc7c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, options),
    method: 'get',
})

buyerShowc262e3fe259ba933a181c4c64c20bc7c.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/parcel-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
buyerShowc262e3fe259ba933a181c4c64c20bc7c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerShowc262e3fe259ba933a181c4c64c20bc7c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
buyerShowc262e3fe259ba933a181c4c64c20bc7c.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
buyerShowc262e3fe259ba933a181c4c64c20bc7c.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
    const buyerShowc262e3fe259ba933a181c4c64c20bc7cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
        buyerShowc262e3fe259ba933a181c4c64c20bc7cForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
        buyerShowc262e3fe259ba933a181c4c64c20bc7cForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerShowc262e3fe259ba933a181c4c64c20bc7c.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerShowc262e3fe259ba933a181c4c64c20bc7c.form = buyerShowc262e3fe259ba933a181c4c64c20bc7cForm
    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
const buyerShow23c6aebeedfb37f3e3844d5342f9bafb = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
    method: 'get',
})

buyerShow23c6aebeedfb37f3e3844d5342f9bafb.definition = {
    methods: ["get","head"],
    url: '/buyer/orders/{id}/parcel-report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerShow23c6aebeedfb37f3e3844d5342f9bafb.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
buyerShow23c6aebeedfb37f3e3844d5342f9bafb.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
buyerShow23c6aebeedfb37f3e3844d5342f9bafb.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
    const buyerShow23c6aebeedfb37f3e3844d5342f9bafbForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
        buyerShow23c6aebeedfb37f3e3844d5342f9bafbForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerShow
 * @see app/Http/Controllers/Api/ParcelReportController.php:29
 * @route '/buyer/orders/{id}/parcel-report'
 */
        buyerShow23c6aebeedfb37f3e3844d5342f9bafbForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerShow23c6aebeedfb37f3e3844d5342f9bafb.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerShow23c6aebeedfb37f3e3844d5342f9bafb.form = buyerShow23c6aebeedfb37f3e3844d5342f9bafbForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\ParcelReportController::buyerShow, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerShow['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerShow = {
    '/api/buyer/orders/{id}/parcel-report': buyerShowc262e3fe259ba933a181c4c64c20bc7c,
    '/buyer/orders/{id}/parcel-report': buyerShow23c6aebeedfb37f3e3844d5342f9bafb,
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
const buyerStorec262e3fe259ba933a181c4c64c20bc7c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerStorec262e3fe259ba933a181c4c64c20bc7c.url(args, options),
    method: 'post',
})

buyerStorec262e3fe259ba933a181c4c64c20bc7c.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/parcel-report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
buyerStorec262e3fe259ba933a181c4c64c20bc7c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerStorec262e3fe259ba933a181c4c64c20bc7c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
buyerStorec262e3fe259ba933a181c4c64c20bc7c.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerStorec262e3fe259ba933a181c4c64c20bc7c.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
    const buyerStorec262e3fe259ba933a181c4c64c20bc7cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerStorec262e3fe259ba933a181c4c64c20bc7c.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/api/buyer/orders/{id}/parcel-report'
 */
        buyerStorec262e3fe259ba933a181c4c64c20bc7cForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerStorec262e3fe259ba933a181c4c64c20bc7c.url(args, options),
            method: 'post',
        })
    
    buyerStorec262e3fe259ba933a181c4c64c20bc7c.form = buyerStorec262e3fe259ba933a181c4c64c20bc7cForm
    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/buyer/orders/{id}/parcel-report'
 */
const buyerStore23c6aebeedfb37f3e3844d5342f9bafb = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerStore23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
    method: 'post',
})

buyerStore23c6aebeedfb37f3e3844d5342f9bafb.definition = {
    methods: ["post"],
    url: '/buyer/orders/{id}/parcel-report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/buyer/orders/{id}/parcel-report'
 */
buyerStore23c6aebeedfb37f3e3844d5342f9bafb.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerStore23c6aebeedfb37f3e3844d5342f9bafb.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/buyer/orders/{id}/parcel-report'
 */
buyerStore23c6aebeedfb37f3e3844d5342f9bafb.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerStore23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/buyer/orders/{id}/parcel-report'
 */
    const buyerStore23c6aebeedfb37f3e3844d5342f9bafbForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerStore23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::buyerStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:50
 * @route '/buyer/orders/{id}/parcel-report'
 */
        buyerStore23c6aebeedfb37f3e3844d5342f9bafbForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerStore23c6aebeedfb37f3e3844d5342f9bafb.url(args, options),
            method: 'post',
        })
    
    buyerStore23c6aebeedfb37f3e3844d5342f9bafb.form = buyerStore23c6aebeedfb37f3e3844d5342f9bafbForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\ParcelReportController::buyerStore, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerStore['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerStore = {
    '/api/buyer/orders/{id}/parcel-report': buyerStorec262e3fe259ba933a181c4c64c20bc7c,
    '/buyer/orders/{id}/parcel-report': buyerStore23c6aebeedfb37f3e3844d5342f9bafb,
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::courierStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:69
 * @route '/api/courier-app/orders/{id}/parcel-report'
 */
export const courierStore = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: courierStore.url(args, options),
    method: 'post',
})

courierStore.definition = {
    methods: ["post"],
    url: '/api/courier-app/orders/{id}/parcel-report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::courierStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:69
 * @route '/api/courier-app/orders/{id}/parcel-report'
 */
courierStore.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return courierStore.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::courierStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:69
 * @route '/api/courier-app/orders/{id}/parcel-report'
 */
courierStore.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: courierStore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::courierStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:69
 * @route '/api/courier-app/orders/{id}/parcel-report'
 */
    const courierStoreForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: courierStore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::courierStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:69
 * @route '/api/courier-app/orders/{id}/parcel-report'
 */
        courierStoreForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: courierStore.url(args, options),
            method: 'post',
        })
    
    courierStore.form = courierStoreForm
/**
* @see \App\Http\Controllers\Api\ParcelReportController::riderStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:59
 * @route '/api/rider-app/jobs/{id}/parcel-report'
 */
export const riderStore = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderStore.url(args, options),
    method: 'post',
})

riderStore.definition = {
    methods: ["post"],
    url: '/api/rider-app/jobs/{id}/parcel-report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ParcelReportController::riderStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:59
 * @route '/api/rider-app/jobs/{id}/parcel-report'
 */
riderStore.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return riderStore.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ParcelReportController::riderStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:59
 * @route '/api/rider-app/jobs/{id}/parcel-report'
 */
riderStore.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderStore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ParcelReportController::riderStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:59
 * @route '/api/rider-app/jobs/{id}/parcel-report'
 */
    const riderStoreForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: riderStore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ParcelReportController::riderStore
 * @see app/Http/Controllers/Api/ParcelReportController.php:59
 * @route '/api/rider-app/jobs/{id}/parcel-report'
 */
        riderStoreForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: riderStore.url(args, options),
            method: 'post',
        })
    
    riderStore.form = riderStoreForm
const ParcelReportController = { buyerShow, buyerStore, courierStore, riderStore }

export default ParcelReportController
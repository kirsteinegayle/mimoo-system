import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
const showddf84a40928a070b47473c843997d483 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showddf84a40928a070b47473c843997d483.url(args, options),
    method: 'get',
})

showddf84a40928a070b47473c843997d483.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/tracking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
showddf84a40928a070b47473c843997d483.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showddf84a40928a070b47473c843997d483.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
showddf84a40928a070b47473c843997d483.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showddf84a40928a070b47473c843997d483.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
showddf84a40928a070b47473c843997d483.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showddf84a40928a070b47473c843997d483.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
    const showddf84a40928a070b47473c843997d483Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showddf84a40928a070b47473c843997d483.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
        showddf84a40928a070b47473c843997d483Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showddf84a40928a070b47473c843997d483.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/buyer/orders/{id}/tracking'
 */
        showddf84a40928a070b47473c843997d483Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showddf84a40928a070b47473c843997d483.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showddf84a40928a070b47473c843997d483.form = showddf84a40928a070b47473c843997d483Form
    /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
const show49bacc511ee93aa7c9a6ace451797d24 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show49bacc511ee93aa7c9a6ace451797d24.url(args, options),
    method: 'get',
})

show49bacc511ee93aa7c9a6ace451797d24.definition = {
    methods: ["get","head"],
    url: '/api/orders/{id}/tracking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
show49bacc511ee93aa7c9a6ace451797d24.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show49bacc511ee93aa7c9a6ace451797d24.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
show49bacc511ee93aa7c9a6ace451797d24.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show49bacc511ee93aa7c9a6ace451797d24.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
show49bacc511ee93aa7c9a6ace451797d24.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show49bacc511ee93aa7c9a6ace451797d24.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
    const show49bacc511ee93aa7c9a6ace451797d24Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show49bacc511ee93aa7c9a6ace451797d24.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
        show49bacc511ee93aa7c9a6ace451797d24Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show49bacc511ee93aa7c9a6ace451797d24.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::show
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:29
 * @route '/api/orders/{id}/tracking'
 */
        show49bacc511ee93aa7c9a6ace451797d24Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show49bacc511ee93aa7c9a6ace451797d24.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show49bacc511ee93aa7c9a6ace451797d24.form = show49bacc511ee93aa7c9a6ace451797d24Form

/**
* Multiple routes resolve to \App\Http\Controllers\Buyer\OrderTrackingController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/orders/{id}/tracking': showddf84a40928a070b47473c843997d483,
    '/api/orders/{id}/tracking': show49bacc511ee93aa7c9a6ace451797d24,
}

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
export const page = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(args, options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/orders/{id}/tracking',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
page.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return page.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
page.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
page.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
    const pageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
        pageForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\OrderTrackingController::page
 * @see app/Http/Controllers/Buyer/OrderTrackingController.php:38
 * @route '/orders/{id}/tracking'
 */
        pageForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    page.form = pageForm
const OrderTrackingController = { show, page }

export default OrderTrackingController
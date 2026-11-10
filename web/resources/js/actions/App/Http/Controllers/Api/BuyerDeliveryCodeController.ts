import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
const showbca5c5a86d6d57fba98c8a4abcfffa81 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, options),
    method: 'get',
})

showbca5c5a86d6d57fba98c8a4abcfffa81.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/delivery-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
showbca5c5a86d6d57fba98c8a4abcfffa81.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showbca5c5a86d6d57fba98c8a4abcfffa81.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
showbca5c5a86d6d57fba98c8a4abcfffa81.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
showbca5c5a86d6d57fba98c8a4abcfffa81.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
    const showbca5c5a86d6d57fba98c8a4abcfffa81Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
        showbca5c5a86d6d57fba98c8a4abcfffa81Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/buyer/orders/{id}/delivery-code'
 */
        showbca5c5a86d6d57fba98c8a4abcfffa81Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showbca5c5a86d6d57fba98c8a4abcfffa81.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showbca5c5a86d6d57fba98c8a4abcfffa81.form = showbca5c5a86d6d57fba98c8a4abcfffa81Form
    /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
const show8052fb13896498926c4de2815eda164c = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show8052fb13896498926c4de2815eda164c.url(args, options),
    method: 'get',
})

show8052fb13896498926c4de2815eda164c.definition = {
    methods: ["get","head"],
    url: '/api/orders/{id}/delivery-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
show8052fb13896498926c4de2815eda164c.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show8052fb13896498926c4de2815eda164c.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
show8052fb13896498926c4de2815eda164c.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show8052fb13896498926c4de2815eda164c.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
show8052fb13896498926c4de2815eda164c.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show8052fb13896498926c4de2815eda164c.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
    const show8052fb13896498926c4de2815eda164cForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show8052fb13896498926c4de2815eda164c.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
        show8052fb13896498926c4de2815eda164cForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show8052fb13896498926c4de2815eda164c.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerDeliveryCodeController::show
 * @see app/Http/Controllers/Api/BuyerDeliveryCodeController.php:31
 * @route '/api/orders/{id}/delivery-code'
 */
        show8052fb13896498926c4de2815eda164cForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show8052fb13896498926c4de2815eda164c.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show8052fb13896498926c4de2815eda164c.form = show8052fb13896498926c4de2815eda164cForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerDeliveryCodeController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/buyer/orders/{id}/delivery-code': showbca5c5a86d6d57fba98c8a4abcfffa81,
    '/api/orders/{id}/delivery-code': show8052fb13896498926c4de2815eda164c,
}

const BuyerDeliveryCodeController = { show }

export default BuyerDeliveryCodeController
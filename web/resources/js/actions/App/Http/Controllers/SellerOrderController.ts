import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/seller/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SellerOrderController::index
 * @see app/Http/Controllers/SellerOrderController.php:19
 * @route '/api/seller/orders'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
export const recent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})

recent.definition = {
    methods: ["get","head"],
    url: '/api/seller/orders/recent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
recent.url = (options?: RouteQueryOptions) => {
    return recent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
recent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
recent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recent.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
    const recentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: recent.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
        recentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SellerOrderController::recent
 * @see app/Http/Controllers/SellerOrderController.php:75
 * @route '/api/seller/orders/recent'
 */
        recentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    recent.form = recentForm
/**
* @see \App\Http\Controllers\SellerOrderController::updateStatus
 * @see app/Http/Controllers/SellerOrderController.php:113
 * @route '/api/seller/orders/{id}/status'
 */
export const updateStatus = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

updateStatus.definition = {
    methods: ["patch"],
    url: '/api/seller/orders/{id}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SellerOrderController::updateStatus
 * @see app/Http/Controllers/SellerOrderController.php:113
 * @route '/api/seller/orders/{id}/status'
 */
updateStatus.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateStatus.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerOrderController::updateStatus
 * @see app/Http/Controllers/SellerOrderController.php:113
 * @route '/api/seller/orders/{id}/status'
 */
updateStatus.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\SellerOrderController::updateStatus
 * @see app/Http/Controllers/SellerOrderController.php:113
 * @route '/api/seller/orders/{id}/status'
 */
    const updateStatusForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SellerOrderController::updateStatus
 * @see app/Http/Controllers/SellerOrderController.php:113
 * @route '/api/seller/orders/{id}/status'
 */
        updateStatusForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
const SellerOrderController = { index, recent, updateStatus }

export default SellerOrderController
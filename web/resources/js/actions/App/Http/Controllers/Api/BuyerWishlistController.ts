import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/wishlist',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::index
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:90
 * @route '/api/buyer/wishlist'
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
* @see \App\Http\Controllers\Api\BuyerWishlistController::store
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:106
 * @route '/api/buyer/wishlist/{productId}'
 */
export const store = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/buyer/wishlist/{productId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::store
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:106
 * @route '/api/buyer/wishlist/{productId}'
 */
store.url = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { productId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    productId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        productId: args.productId,
                }

    return store.definition.url
            .replace('{productId}', parsedArgs.productId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::store
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:106
 * @route '/api/buyer/wishlist/{productId}'
 */
store.post = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::store
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:106
 * @route '/api/buyer/wishlist/{productId}'
 */
    const storeForm = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::store
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:106
 * @route '/api/buyer/wishlist/{productId}'
 */
        storeForm.post = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::destroy
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:149
 * @route '/api/buyer/wishlist/{productId}'
 */
export const destroy = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/buyer/wishlist/{productId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::destroy
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:149
 * @route '/api/buyer/wishlist/{productId}'
 */
destroy.url = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { productId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    productId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        productId: args.productId,
                }

    return destroy.definition.url
            .replace('{productId}', parsedArgs.productId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerWishlistController::destroy
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:149
 * @route '/api/buyer/wishlist/{productId}'
 */
destroy.delete = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::destroy
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:149
 * @route '/api/buyer/wishlist/{productId}'
 */
    const destroyForm = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerWishlistController::destroy
 * @see app/Http/Controllers/Api/BuyerWishlistController.php:149
 * @route '/api/buyer/wishlist/{productId}'
 */
        destroyForm.delete = (args: { productId: string | number } | [productId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BuyerWishlistController = { index, store, destroy }

export default BuyerWishlistController
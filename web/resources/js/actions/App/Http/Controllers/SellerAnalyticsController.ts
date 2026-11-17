import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/seller/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SellerAnalyticsController::index
 * @see app/Http/Controllers/SellerAnalyticsController.php:25
 * @route '/api/seller/analytics'
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
const SellerAnalyticsController = { index }

export default SellerAnalyticsController
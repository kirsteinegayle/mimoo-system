import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/seller/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SellerDashboardController::index
 * @see app/Http/Controllers/SellerDashboardController.php:19
 * @route '/seller/dashboard'
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
* @see \App\Http\Controllers\SellerDashboardController::updateStoreName
 * @see app/Http/Controllers/SellerDashboardController.php:273
 * @route '/seller/store-name'
 */
export const updateStoreName = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStoreName.url(options),
    method: 'put',
})

updateStoreName.definition = {
    methods: ["put"],
    url: '/seller/store-name',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SellerDashboardController::updateStoreName
 * @see app/Http/Controllers/SellerDashboardController.php:273
 * @route '/seller/store-name'
 */
updateStoreName.url = (options?: RouteQueryOptions) => {
    return updateStoreName.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SellerDashboardController::updateStoreName
 * @see app/Http/Controllers/SellerDashboardController.php:273
 * @route '/seller/store-name'
 */
updateStoreName.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStoreName.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\SellerDashboardController::updateStoreName
 * @see app/Http/Controllers/SellerDashboardController.php:273
 * @route '/seller/store-name'
 */
    const updateStoreNameForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStoreName.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SellerDashboardController::updateStoreName
 * @see app/Http/Controllers/SellerDashboardController.php:273
 * @route '/seller/store-name'
 */
        updateStoreNameForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStoreName.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStoreName.form = updateStoreNameForm
const SellerDashboardController = { index, updateStoreName }

export default SellerDashboardController
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/complaints',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\ComplaintController::index
 * @see app/Http/Controllers/Buyer/ComplaintController.php:28
 * @route '/complaints'
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
* @see \App\Http\Controllers\Buyer\ComplaintController::store
 * @see app/Http/Controllers/Buyer/ComplaintController.php:63
 * @route '/complaints'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/complaints',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Buyer\ComplaintController::store
 * @see app/Http/Controllers/Buyer/ComplaintController.php:63
 * @route '/complaints'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\ComplaintController::store
 * @see app/Http/Controllers/Buyer/ComplaintController.php:63
 * @route '/complaints'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Buyer\ComplaintController::store
 * @see app/Http/Controllers/Buyer/ComplaintController.php:63
 * @route '/complaints'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Buyer\ComplaintController::store
 * @see app/Http/Controllers/Buyer/ComplaintController.php:63
 * @route '/complaints'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const ComplaintController = { index, store }

export default ComplaintController
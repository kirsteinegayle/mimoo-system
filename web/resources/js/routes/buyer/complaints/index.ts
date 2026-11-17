import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
const complaints = {
    store: Object.assign(store, store),
}

export default complaints
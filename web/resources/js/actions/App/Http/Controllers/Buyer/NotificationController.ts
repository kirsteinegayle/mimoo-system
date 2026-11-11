import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/buyer/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Buyer\NotificationController::index
 * @see app/Http/Controllers/Buyer/NotificationController.php:58
 * @route '/buyer/notifications'
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
const NotificationController = { index }

export default NotificationController
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/buyer/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
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
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/api/buyer/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
    const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
        markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead.url(options),
            method: 'post',
        })
    
    markAllRead.form = markAllReadForm
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/api/buyer/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
markRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
const BuyerNotificationController = { index, markAllRead, markRead }

export default BuyerNotificationController
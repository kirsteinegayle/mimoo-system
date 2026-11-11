import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/seller/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\NotificationController::page
 * @see app/Http/Controllers/Seller/NotificationController.php:80
 * @route '/seller/notifications'
 */
        pageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    page.form = pageForm
/**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/seller/notifications/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Seller\NotificationController::feed
 * @see app/Http/Controllers/Seller/NotificationController.php:90
 * @route '/seller/notifications/feed'
 */
        feedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feed.form = feedForm
/**
* @see \App\Http\Controllers\Seller\NotificationController::markAllRead
 * @see app/Http/Controllers/Seller/NotificationController.php:114
 * @route '/seller/notifications/read-all'
 */
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/seller/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Seller\NotificationController::markAllRead
 * @see app/Http/Controllers/Seller/NotificationController.php:114
 * @route '/seller/notifications/read-all'
 */
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Seller\NotificationController::markAllRead
 * @see app/Http/Controllers/Seller/NotificationController.php:114
 * @route '/seller/notifications/read-all'
 */
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Seller\NotificationController::markAllRead
 * @see app/Http/Controllers/Seller/NotificationController.php:114
 * @route '/seller/notifications/read-all'
 */
    const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Seller\NotificationController::markAllRead
 * @see app/Http/Controllers/Seller/NotificationController.php:114
 * @route '/seller/notifications/read-all'
 */
        markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead.url(options),
            method: 'post',
        })
    
    markAllRead.form = markAllReadForm
/**
* @see \App\Http\Controllers\Seller\NotificationController::markRead
 * @see app/Http/Controllers/Seller/NotificationController.php:98
 * @route '/seller/notifications/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/seller/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Seller\NotificationController::markRead
 * @see app/Http/Controllers/Seller/NotificationController.php:98
 * @route '/seller/notifications/{id}/read'
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
* @see \App\Http\Controllers\Seller\NotificationController::markRead
 * @see app/Http/Controllers/Seller/NotificationController.php:98
 * @route '/seller/notifications/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Seller\NotificationController::markRead
 * @see app/Http/Controllers/Seller/NotificationController.php:98
 * @route '/seller/notifications/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Seller\NotificationController::markRead
 * @see app/Http/Controllers/Seller/NotificationController.php:98
 * @route '/seller/notifications/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
const NotificationController = { page, feed, markAllRead, markRead }

export default NotificationController
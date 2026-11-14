import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/courier/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\NotificationController::page
 * @see app/Http/Controllers/Courier/NotificationController.php:80
 * @route '/courier/notifications'
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
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/courier/notifications/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Courier\NotificationController::feed
 * @see app/Http/Controllers/Courier/NotificationController.php:93
 * @route '/courier/notifications/feed'
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
* @see \App\Http\Controllers\Courier\NotificationController::markAllRead
 * @see app/Http/Controllers/Courier/NotificationController.php:118
 * @route '/courier/notifications/read-all'
 */
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/courier/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\NotificationController::markAllRead
 * @see app/Http/Controllers/Courier/NotificationController.php:118
 * @route '/courier/notifications/read-all'
 */
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Courier\NotificationController::markAllRead
 * @see app/Http/Controllers/Courier/NotificationController.php:118
 * @route '/courier/notifications/read-all'
 */
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\NotificationController::markAllRead
 * @see app/Http/Controllers/Courier/NotificationController.php:118
 * @route '/courier/notifications/read-all'
 */
    const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\NotificationController::markAllRead
 * @see app/Http/Controllers/Courier/NotificationController.php:118
 * @route '/courier/notifications/read-all'
 */
        markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead.url(options),
            method: 'post',
        })
    
    markAllRead.form = markAllReadForm
/**
* @see \App\Http\Controllers\Courier\NotificationController::markRead
 * @see app/Http/Controllers/Courier/NotificationController.php:100
 * @route '/courier/notifications/{id}/read'
 */
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/courier/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Courier\NotificationController::markRead
 * @see app/Http/Controllers/Courier/NotificationController.php:100
 * @route '/courier/notifications/{id}/read'
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
* @see \App\Http\Controllers\Courier\NotificationController::markRead
 * @see app/Http/Controllers/Courier/NotificationController.php:100
 * @route '/courier/notifications/{id}/read'
 */
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Courier\NotificationController::markRead
 * @see app/Http/Controllers/Courier/NotificationController.php:100
 * @route '/courier/notifications/{id}/read'
 */
    const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Courier\NotificationController::markRead
 * @see app/Http/Controllers/Courier/NotificationController.php:100
 * @route '/courier/notifications/{id}/read'
 */
        markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead.url(args, options),
            method: 'post',
        })
    
    markRead.form = markReadForm
const NotificationController = { page, feed, markAllRead, markRead }

export default NotificationController
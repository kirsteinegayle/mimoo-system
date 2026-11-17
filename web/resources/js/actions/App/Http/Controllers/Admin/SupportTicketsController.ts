import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/admin/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
    const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: page.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
 */
        pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: page.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::page
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:27
 * @route '/admin/support'
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
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
export const feed = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})

feed.definition = {
    methods: ["get","head"],
    url: '/admin/support/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
feed.url = (options?: RouteQueryOptions) => {
    return feed.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
feed.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
feed.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
    const feedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
 */
        feedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::feed
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:32
 * @route '/admin/support/feed'
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
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/support/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::show
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:48
 * @route '/admin/support/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::reply
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:65
 * @route '/admin/support/{id}/reply'
 */
export const reply = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

reply.definition = {
    methods: ["post"],
    url: '/admin/support/{id}/reply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::reply
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:65
 * @route '/admin/support/{id}/reply'
 */
reply.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::reply
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:65
 * @route '/admin/support/{id}/reply'
 */
reply.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::reply
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:65
 * @route '/admin/support/{id}/reply'
 */
    const replyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::reply
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:65
 * @route '/admin/support/{id}/reply'
 */
        replyForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply.url(args, options),
            method: 'post',
        })
    
    reply.form = replyForm
/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::status
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:84
 * @route '/admin/support/{id}/status'
 */
export const status = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/admin/support/{id}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::status
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:84
 * @route '/admin/support/{id}/status'
 */
status.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return status.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportTicketsController::status
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:84
 * @route '/admin/support/{id}/status'
 */
status.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::status
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:84
 * @route '/admin/support/{id}/status'
 */
    const statusForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\SupportTicketsController::status
 * @see app/Http/Controllers/Admin/SupportTicketsController.php:84
 * @route '/admin/support/{id}/status'
 */
        statusForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
const SupportTicketsController = { page, feed, show, reply, status }

export default SupportTicketsController
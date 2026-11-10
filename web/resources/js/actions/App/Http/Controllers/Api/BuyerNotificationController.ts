import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
const index6d76287bcae08a43190f25810c476720 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6d76287bcae08a43190f25810c476720.url(options),
    method: 'get',
})

index6d76287bcae08a43190f25810c476720.definition = {
    methods: ["get","head"],
    url: '/api/buyer/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index6d76287bcae08a43190f25810c476720.url = (options?: RouteQueryOptions) => {
    return index6d76287bcae08a43190f25810c476720.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index6d76287bcae08a43190f25810c476720.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6d76287bcae08a43190f25810c476720.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
index6d76287bcae08a43190f25810c476720.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index6d76287bcae08a43190f25810c476720.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
    const index6d76287bcae08a43190f25810c476720Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index6d76287bcae08a43190f25810c476720.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
        index6d76287bcae08a43190f25810c476720Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index6d76287bcae08a43190f25810c476720.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/api/buyer/notifications'
 */
        index6d76287bcae08a43190f25810c476720Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index6d76287bcae08a43190f25810c476720.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index6d76287bcae08a43190f25810c476720.form = index6d76287bcae08a43190f25810c476720Form
    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
const index35c50dc113e3528cb8a489abdb9e43a0 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index35c50dc113e3528cb8a489abdb9e43a0.url(options),
    method: 'get',
})

index35c50dc113e3528cb8a489abdb9e43a0.definition = {
    methods: ["get","head"],
    url: '/buyer/notifications/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
index35c50dc113e3528cb8a489abdb9e43a0.url = (options?: RouteQueryOptions) => {
    return index35c50dc113e3528cb8a489abdb9e43a0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
index35c50dc113e3528cb8a489abdb9e43a0.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index35c50dc113e3528cb8a489abdb9e43a0.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
index35c50dc113e3528cb8a489abdb9e43a0.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index35c50dc113e3528cb8a489abdb9e43a0.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
    const index35c50dc113e3528cb8a489abdb9e43a0Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index35c50dc113e3528cb8a489abdb9e43a0.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
        index35c50dc113e3528cb8a489abdb9e43a0Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index35c50dc113e3528cb8a489abdb9e43a0.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::index
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:41
 * @route '/buyer/notifications/feed'
 */
        index35c50dc113e3528cb8a489abdb9e43a0Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index35c50dc113e3528cb8a489abdb9e43a0.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index35c50dc113e3528cb8a489abdb9e43a0.form = index35c50dc113e3528cb8a489abdb9e43a0Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerNotificationController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/buyer/notifications': index6d76287bcae08a43190f25810c476720,
    '/buyer/notifications/feed': index35c50dc113e3528cb8a489abdb9e43a0,
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
const markAllRead2420c7219363588379193c4019a26230 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead2420c7219363588379193c4019a26230.url(options),
    method: 'post',
})

markAllRead2420c7219363588379193c4019a26230.definition = {
    methods: ["post"],
    url: '/api/buyer/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
markAllRead2420c7219363588379193c4019a26230.url = (options?: RouteQueryOptions) => {
    return markAllRead2420c7219363588379193c4019a26230.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
markAllRead2420c7219363588379193c4019a26230.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead2420c7219363588379193c4019a26230.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
    const markAllRead2420c7219363588379193c4019a26230Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead2420c7219363588379193c4019a26230.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/api/buyer/notifications/read-all'
 */
        markAllRead2420c7219363588379193c4019a26230Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead2420c7219363588379193c4019a26230.url(options),
            method: 'post',
        })
    
    markAllRead2420c7219363588379193c4019a26230.form = markAllRead2420c7219363588379193c4019a26230Form
    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/buyer/notifications/read-all'
 */
const markAllRead02f0d350be33d9e1c6a5b4f994866562 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead02f0d350be33d9e1c6a5b4f994866562.url(options),
    method: 'post',
})

markAllRead02f0d350be33d9e1c6a5b4f994866562.definition = {
    methods: ["post"],
    url: '/buyer/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/buyer/notifications/read-all'
 */
markAllRead02f0d350be33d9e1c6a5b4f994866562.url = (options?: RouteQueryOptions) => {
    return markAllRead02f0d350be33d9e1c6a5b4f994866562.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/buyer/notifications/read-all'
 */
markAllRead02f0d350be33d9e1c6a5b4f994866562.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead02f0d350be33d9e1c6a5b4f994866562.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/buyer/notifications/read-all'
 */
    const markAllRead02f0d350be33d9e1c6a5b4f994866562Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAllRead02f0d350be33d9e1c6a5b4f994866562.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markAllRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:80
 * @route '/buyer/notifications/read-all'
 */
        markAllRead02f0d350be33d9e1c6a5b4f994866562Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAllRead02f0d350be33d9e1c6a5b4f994866562.url(options),
            method: 'post',
        })
    
    markAllRead02f0d350be33d9e1c6a5b4f994866562.form = markAllRead02f0d350be33d9e1c6a5b4f994866562Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerNotificationController::markAllRead, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `markAllRead['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const markAllRead = {
    '/api/buyer/notifications/read-all': markAllRead2420c7219363588379193c4019a26230,
    '/buyer/notifications/read-all': markAllRead02f0d350be33d9e1c6a5b4f994866562,
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
const markReadad524bf504dd77dd29ea609b23b7da94 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markReadad524bf504dd77dd29ea609b23b7da94.url(args, options),
    method: 'post',
})

markReadad524bf504dd77dd29ea609b23b7da94.definition = {
    methods: ["post"],
    url: '/api/buyer/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
markReadad524bf504dd77dd29ea609b23b7da94.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markReadad524bf504dd77dd29ea609b23b7da94.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
markReadad524bf504dd77dd29ea609b23b7da94.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markReadad524bf504dd77dd29ea609b23b7da94.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
    const markReadad524bf504dd77dd29ea609b23b7da94Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markReadad524bf504dd77dd29ea609b23b7da94.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/api/buyer/notifications/{id}/read'
 */
        markReadad524bf504dd77dd29ea609b23b7da94Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markReadad524bf504dd77dd29ea609b23b7da94.url(args, options),
            method: 'post',
        })
    
    markReadad524bf504dd77dd29ea609b23b7da94.form = markReadad524bf504dd77dd29ea609b23b7da94Form
    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/buyer/notifications/{id}/read'
 */
const markRead71bfb7429962d0b4f029bcfcf42cca1f = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead71bfb7429962d0b4f029bcfcf42cca1f.url(args, options),
    method: 'post',
})

markRead71bfb7429962d0b4f029bcfcf42cca1f.definition = {
    methods: ["post"],
    url: '/buyer/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/buyer/notifications/{id}/read'
 */
markRead71bfb7429962d0b4f029bcfcf42cca1f.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markRead71bfb7429962d0b4f029bcfcf42cca1f.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/buyer/notifications/{id}/read'
 */
markRead71bfb7429962d0b4f029bcfcf42cca1f.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead71bfb7429962d0b4f029bcfcf42cca1f.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/buyer/notifications/{id}/read'
 */
    const markRead71bfb7429962d0b4f029bcfcf42cca1fForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markRead71bfb7429962d0b4f029bcfcf42cca1f.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\BuyerNotificationController::markRead
 * @see app/Http/Controllers/Api/BuyerNotificationController.php:61
 * @route '/buyer/notifications/{id}/read'
 */
        markRead71bfb7429962d0b4f029bcfcf42cca1fForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markRead71bfb7429962d0b4f029bcfcf42cca1f.url(args, options),
            method: 'post',
        })
    
    markRead71bfb7429962d0b4f029bcfcf42cca1f.form = markRead71bfb7429962d0b4f029bcfcf42cca1fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\BuyerNotificationController::markRead, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `markRead['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const markRead = {
    '/api/buyer/notifications/{id}/read': markReadad524bf504dd77dd29ea609b23b7da94,
    '/buyer/notifications/{id}/read': markRead71bfb7429962d0b4f029bcfcf42cca1f,
}

const BuyerNotificationController = { index, markAllRead, markRead }

export default BuyerNotificationController
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
const feedc9cb5ddb66dd625062f37c9f4b24daeb = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedc9cb5ddb66dd625062f37c9f4b24daeb.url(options),
    method: 'get',
})

feedc9cb5ddb66dd625062f37c9f4b24daeb.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/staff-support/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
feedc9cb5ddb66dd625062f37c9f4b24daeb.url = (options?: RouteQueryOptions) => {
    return feedc9cb5ddb66dd625062f37c9f4b24daeb.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
feedc9cb5ddb66dd625062f37c9f4b24daeb.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feedc9cb5ddb66dd625062f37c9f4b24daeb.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
feedc9cb5ddb66dd625062f37c9f4b24daeb.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feedc9cb5ddb66dd625062f37c9f4b24daeb.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
    const feedc9cb5ddb66dd625062f37c9f4b24daebForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feedc9cb5ddb66dd625062f37c9f4b24daeb.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
        feedc9cb5ddb66dd625062f37c9f4b24daebForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedc9cb5ddb66dd625062f37c9f4b24daeb.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/api/courier-app/staff-support/feed'
 */
        feedc9cb5ddb66dd625062f37c9f4b24daebForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feedc9cb5ddb66dd625062f37c9f4b24daeb.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feedc9cb5ddb66dd625062f37c9f4b24daeb.form = feedc9cb5ddb66dd625062f37c9f4b24daebForm
    /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
const feed2a4586a7699fc68d1db94a0f96a25b3b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed2a4586a7699fc68d1db94a0f96a25b3b.url(options),
    method: 'get',
})

feed2a4586a7699fc68d1db94a0f96a25b3b.definition = {
    methods: ["get","head"],
    url: '/staff-support/feed',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
feed2a4586a7699fc68d1db94a0f96a25b3b.url = (options?: RouteQueryOptions) => {
    return feed2a4586a7699fc68d1db94a0f96a25b3b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
feed2a4586a7699fc68d1db94a0f96a25b3b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: feed2a4586a7699fc68d1db94a0f96a25b3b.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
feed2a4586a7699fc68d1db94a0f96a25b3b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: feed2a4586a7699fc68d1db94a0f96a25b3b.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
    const feed2a4586a7699fc68d1db94a0f96a25b3bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: feed2a4586a7699fc68d1db94a0f96a25b3b.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
        feed2a4586a7699fc68d1db94a0f96a25b3bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed2a4586a7699fc68d1db94a0f96a25b3b.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StaffSupportController::feed
 * @see app/Http/Controllers/StaffSupportController.php:49
 * @route '/staff-support/feed'
 */
        feed2a4586a7699fc68d1db94a0f96a25b3bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: feed2a4586a7699fc68d1db94a0f96a25b3b.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    feed2a4586a7699fc68d1db94a0f96a25b3b.form = feed2a4586a7699fc68d1db94a0f96a25b3bForm

/**
* Multiple routes resolve to \App\Http\Controllers\StaffSupportController::feed, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `feed['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const feed = {
    '/api/courier-app/staff-support/feed': feedc9cb5ddb66dd625062f37c9f4b24daeb,
    '/staff-support/feed': feed2a4586a7699fc68d1db94a0f96a25b3b,
}

/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
const showc11e94f68dcf72af155642794c86491d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc11e94f68dcf72af155642794c86491d.url(args, options),
    method: 'get',
})

showc11e94f68dcf72af155642794c86491d.definition = {
    methods: ["get","head"],
    url: '/api/courier-app/staff-support/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
showc11e94f68dcf72af155642794c86491d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showc11e94f68dcf72af155642794c86491d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
showc11e94f68dcf72af155642794c86491d.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc11e94f68dcf72af155642794c86491d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
showc11e94f68dcf72af155642794c86491d.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showc11e94f68dcf72af155642794c86491d.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
    const showc11e94f68dcf72af155642794c86491dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showc11e94f68dcf72af155642794c86491d.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
        showc11e94f68dcf72af155642794c86491dForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showc11e94f68dcf72af155642794c86491d.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/api/courier-app/staff-support/{id}'
 */
        showc11e94f68dcf72af155642794c86491dForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showc11e94f68dcf72af155642794c86491d.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showc11e94f68dcf72af155642794c86491d.form = showc11e94f68dcf72af155642794c86491dForm
    /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
const showa2b17e81f4a91ba9307d900036e763f3 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showa2b17e81f4a91ba9307d900036e763f3.url(args, options),
    method: 'get',
})

showa2b17e81f4a91ba9307d900036e763f3.definition = {
    methods: ["get","head"],
    url: '/staff-support/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
showa2b17e81f4a91ba9307d900036e763f3.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showa2b17e81f4a91ba9307d900036e763f3.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
showa2b17e81f4a91ba9307d900036e763f3.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showa2b17e81f4a91ba9307d900036e763f3.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
showa2b17e81f4a91ba9307d900036e763f3.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showa2b17e81f4a91ba9307d900036e763f3.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
    const showa2b17e81f4a91ba9307d900036e763f3Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showa2b17e81f4a91ba9307d900036e763f3.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
        showa2b17e81f4a91ba9307d900036e763f3Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showa2b17e81f4a91ba9307d900036e763f3.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StaffSupportController::show
 * @see app/Http/Controllers/StaffSupportController.php:67
 * @route '/staff-support/{id}'
 */
        showa2b17e81f4a91ba9307d900036e763f3Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showa2b17e81f4a91ba9307d900036e763f3.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showa2b17e81f4a91ba9307d900036e763f3.form = showa2b17e81f4a91ba9307d900036e763f3Form

/**
* Multiple routes resolve to \App\Http\Controllers\StaffSupportController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/courier-app/staff-support/{id}': showc11e94f68dcf72af155642794c86491d,
    '/staff-support/{id}': showa2b17e81f4a91ba9307d900036e763f3,
}

/**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/api/courier-app/staff-support/{id}/reply'
 */
const reply547773621ced199c370a325849ca78d5 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply547773621ced199c370a325849ca78d5.url(args, options),
    method: 'post',
})

reply547773621ced199c370a325849ca78d5.definition = {
    methods: ["post"],
    url: '/api/courier-app/staff-support/{id}/reply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/api/courier-app/staff-support/{id}/reply'
 */
reply547773621ced199c370a325849ca78d5.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply547773621ced199c370a325849ca78d5.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/api/courier-app/staff-support/{id}/reply'
 */
reply547773621ced199c370a325849ca78d5.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply547773621ced199c370a325849ca78d5.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/api/courier-app/staff-support/{id}/reply'
 */
    const reply547773621ced199c370a325849ca78d5Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply547773621ced199c370a325849ca78d5.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/api/courier-app/staff-support/{id}/reply'
 */
        reply547773621ced199c370a325849ca78d5Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply547773621ced199c370a325849ca78d5.url(args, options),
            method: 'post',
        })
    
    reply547773621ced199c370a325849ca78d5.form = reply547773621ced199c370a325849ca78d5Form
    /**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/staff-support/{id}/reply'
 */
const reply381ab42996b9fd0f1b612f343edf13ae = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply381ab42996b9fd0f1b612f343edf13ae.url(args, options),
    method: 'post',
})

reply381ab42996b9fd0f1b612f343edf13ae.definition = {
    methods: ["post"],
    url: '/staff-support/{id}/reply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/staff-support/{id}/reply'
 */
reply381ab42996b9fd0f1b612f343edf13ae.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply381ab42996b9fd0f1b612f343edf13ae.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/staff-support/{id}/reply'
 */
reply381ab42996b9fd0f1b612f343edf13ae.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply381ab42996b9fd0f1b612f343edf13ae.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/staff-support/{id}/reply'
 */
    const reply381ab42996b9fd0f1b612f343edf13aeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply381ab42996b9fd0f1b612f343edf13ae.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::reply
 * @see app/Http/Controllers/StaffSupportController.php:84
 * @route '/staff-support/{id}/reply'
 */
        reply381ab42996b9fd0f1b612f343edf13aeForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply381ab42996b9fd0f1b612f343edf13ae.url(args, options),
            method: 'post',
        })
    
    reply381ab42996b9fd0f1b612f343edf13ae.form = reply381ab42996b9fd0f1b612f343edf13aeForm

/**
* Multiple routes resolve to \App\Http\Controllers\StaffSupportController::reply, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `reply['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const reply = {
    '/api/courier-app/staff-support/{id}/reply': reply547773621ced199c370a325849ca78d5,
    '/staff-support/{id}/reply': reply381ab42996b9fd0f1b612f343edf13ae,
}

/**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/api/courier-app/staff-support/{id}/status'
 */
const status35d5a31b9491a8560a6c082ca6538303 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status35d5a31b9491a8560a6c082ca6538303.url(args, options),
    method: 'post',
})

status35d5a31b9491a8560a6c082ca6538303.definition = {
    methods: ["post"],
    url: '/api/courier-app/staff-support/{id}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/api/courier-app/staff-support/{id}/status'
 */
status35d5a31b9491a8560a6c082ca6538303.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return status35d5a31b9491a8560a6c082ca6538303.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/api/courier-app/staff-support/{id}/status'
 */
status35d5a31b9491a8560a6c082ca6538303.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status35d5a31b9491a8560a6c082ca6538303.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/api/courier-app/staff-support/{id}/status'
 */
    const status35d5a31b9491a8560a6c082ca6538303Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status35d5a31b9491a8560a6c082ca6538303.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/api/courier-app/staff-support/{id}/status'
 */
        status35d5a31b9491a8560a6c082ca6538303Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status35d5a31b9491a8560a6c082ca6538303.url(args, options),
            method: 'post',
        })
    
    status35d5a31b9491a8560a6c082ca6538303.form = status35d5a31b9491a8560a6c082ca6538303Form
    /**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/staff-support/{id}/status'
 */
const status6d5f4ff3e962afdb6f6f3764c1c14b8d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status6d5f4ff3e962afdb6f6f3764c1c14b8d.url(args, options),
    method: 'post',
})

status6d5f4ff3e962afdb6f6f3764c1c14b8d.definition = {
    methods: ["post"],
    url: '/staff-support/{id}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/staff-support/{id}/status'
 */
status6d5f4ff3e962afdb6f6f3764c1c14b8d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return status6d5f4ff3e962afdb6f6f3764c1c14b8d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/staff-support/{id}/status'
 */
status6d5f4ff3e962afdb6f6f3764c1c14b8d.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status6d5f4ff3e962afdb6f6f3764c1c14b8d.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/staff-support/{id}/status'
 */
    const status6d5f4ff3e962afdb6f6f3764c1c14b8dForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status6d5f4ff3e962afdb6f6f3764c1c14b8d.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StaffSupportController::status
 * @see app/Http/Controllers/StaffSupportController.php:103
 * @route '/staff-support/{id}/status'
 */
        status6d5f4ff3e962afdb6f6f3764c1c14b8dForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status6d5f4ff3e962afdb6f6f3764c1c14b8d.url(args, options),
            method: 'post',
        })
    
    status6d5f4ff3e962afdb6f6f3764c1c14b8d.form = status6d5f4ff3e962afdb6f6f3764c1c14b8dForm

/**
* Multiple routes resolve to \App\Http\Controllers\StaffSupportController::status, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `status['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const status = {
    '/api/courier-app/staff-support/{id}/status': status35d5a31b9491a8560a6c082ca6538303,
    '/staff-support/{id}/status': status6d5f4ff3e962afdb6f6f3764c1c14b8d,
}

const StaffSupportController = { feed, show, reply, status }

export default StaffSupportController
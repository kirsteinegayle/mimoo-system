import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
const buyerIndex065f9b5176152739bdf98396e36a75d4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, options),
    method: 'get',
})

buyerIndex065f9b5176152739bdf98396e36a75d4.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex065f9b5176152739bdf98396e36a75d4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerIndex065f9b5176152739bdf98396e36a75d4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex065f9b5176152739bdf98396e36a75d4.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex065f9b5176152739bdf98396e36a75d4.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
    const buyerIndex065f9b5176152739bdf98396e36a75d4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerIndex065f9b5176152739bdf98396e36a75d4Form.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerIndex065f9b5176152739bdf98396e36a75d4Form.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex065f9b5176152739bdf98396e36a75d4.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerIndex065f9b5176152739bdf98396e36a75d4.form = buyerIndex065f9b5176152739bdf98396e36a75d4Form
    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
const buyerIndex6428ab693f19d01ce61f906f0827e81e = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, options),
    method: 'get',
})

buyerIndex6428ab693f19d01ce61f906f0827e81e.definition = {
    methods: ["get","head"],
    url: '/buyer/orders/{id}/rider-chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
buyerIndex6428ab693f19d01ce61f906f0827e81e.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerIndex6428ab693f19d01ce61f906f0827e81e.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
buyerIndex6428ab693f19d01ce61f906f0827e81e.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
buyerIndex6428ab693f19d01ce61f906f0827e81e.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
    const buyerIndex6428ab693f19d01ce61f906f0827e81eForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
        buyerIndex6428ab693f19d01ce61f906f0827e81eForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/buyer/orders/{id}/rider-chat'
 */
        buyerIndex6428ab693f19d01ce61f906f0827e81eForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex6428ab693f19d01ce61f906f0827e81e.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerIndex6428ab693f19d01ce61f906f0827e81e.form = buyerIndex6428ab693f19d01ce61f906f0827e81eForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\DeliveryChatController::buyerIndex, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerIndex['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerIndex = {
    '/api/buyer/orders/{id}/chat': buyerIndex065f9b5176152739bdf98396e36a75d4,
    '/buyer/orders/{id}/rider-chat': buyerIndex6428ab693f19d01ce61f906f0827e81e,
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
const buyerSend065f9b5176152739bdf98396e36a75d4 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend065f9b5176152739bdf98396e36a75d4.url(args, options),
    method: 'post',
})

buyerSend065f9b5176152739bdf98396e36a75d4.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerSend065f9b5176152739bdf98396e36a75d4.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerSend065f9b5176152739bdf98396e36a75d4.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerSend065f9b5176152739bdf98396e36a75d4.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend065f9b5176152739bdf98396e36a75d4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
    const buyerSend065f9b5176152739bdf98396e36a75d4Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerSend065f9b5176152739bdf98396e36a75d4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerSend065f9b5176152739bdf98396e36a75d4Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerSend065f9b5176152739bdf98396e36a75d4.url(args, options),
            method: 'post',
        })
    
    buyerSend065f9b5176152739bdf98396e36a75d4.form = buyerSend065f9b5176152739bdf98396e36a75d4Form
    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/buyer/orders/{id}/rider-chat'
 */
const buyerSend6428ab693f19d01ce61f906f0827e81e = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend6428ab693f19d01ce61f906f0827e81e.url(args, options),
    method: 'post',
})

buyerSend6428ab693f19d01ce61f906f0827e81e.definition = {
    methods: ["post"],
    url: '/buyer/orders/{id}/rider-chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/buyer/orders/{id}/rider-chat'
 */
buyerSend6428ab693f19d01ce61f906f0827e81e.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerSend6428ab693f19d01ce61f906f0827e81e.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/buyer/orders/{id}/rider-chat'
 */
buyerSend6428ab693f19d01ce61f906f0827e81e.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend6428ab693f19d01ce61f906f0827e81e.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/buyer/orders/{id}/rider-chat'
 */
    const buyerSend6428ab693f19d01ce61f906f0827e81eForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerSend6428ab693f19d01ce61f906f0827e81e.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/buyer/orders/{id}/rider-chat'
 */
        buyerSend6428ab693f19d01ce61f906f0827e81eForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerSend6428ab693f19d01ce61f906f0827e81e.url(args, options),
            method: 'post',
        })
    
    buyerSend6428ab693f19d01ce61f906f0827e81e.form = buyerSend6428ab693f19d01ce61f906f0827e81eForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\DeliveryChatController::buyerSend, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerSend['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerSend = {
    '/api/buyer/orders/{id}/chat': buyerSend065f9b5176152739bdf98396e36a75d4,
    '/buyer/orders/{id}/rider-chat': buyerSend6428ab693f19d01ce61f906f0827e81e,
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
const buyerRead7d9a2b4c5be702113b5c171bb77cd9b3 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.url(args, options),
    method: 'post',
})

buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/chat/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
    const buyerRead7d9a2b4c5be702113b5c171bb77cd9b3Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
        buyerRead7d9a2b4c5be702113b5c171bb77cd9b3Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.url(args, options),
            method: 'post',
        })
    
    buyerRead7d9a2b4c5be702113b5c171bb77cd9b3.form = buyerRead7d9a2b4c5be702113b5c171bb77cd9b3Form
    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/buyer/orders/{id}/rider-chat/read'
 */
const buyerReadc7c9237df33710fc63c41c9d782eab07 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerReadc7c9237df33710fc63c41c9d782eab07.url(args, options),
    method: 'post',
})

buyerReadc7c9237df33710fc63c41c9d782eab07.definition = {
    methods: ["post"],
    url: '/buyer/orders/{id}/rider-chat/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/buyer/orders/{id}/rider-chat/read'
 */
buyerReadc7c9237df33710fc63c41c9d782eab07.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerReadc7c9237df33710fc63c41c9d782eab07.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/buyer/orders/{id}/rider-chat/read'
 */
buyerReadc7c9237df33710fc63c41c9d782eab07.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerReadc7c9237df33710fc63c41c9d782eab07.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/buyer/orders/{id}/rider-chat/read'
 */
    const buyerReadc7c9237df33710fc63c41c9d782eab07Form = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerReadc7c9237df33710fc63c41c9d782eab07.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/buyer/orders/{id}/rider-chat/read'
 */
        buyerReadc7c9237df33710fc63c41c9d782eab07Form.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerReadc7c9237df33710fc63c41c9d782eab07.url(args, options),
            method: 'post',
        })
    
    buyerReadc7c9237df33710fc63c41c9d782eab07.form = buyerReadc7c9237df33710fc63c41c9d782eab07Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\DeliveryChatController::buyerRead, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerRead['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerRead = {
    '/api/buyer/orders/{id}/chat/read': buyerRead7d9a2b4c5be702113b5c171bb77cd9b3,
    '/buyer/orders/{id}/rider-chat/read': buyerReadc7c9237df33710fc63c41c9d782eab07,
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
const buyerThreads426b45b8ecb2de18e66e7b188b5ef042 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url(options),
    method: 'get',
})

buyerThreads426b45b8ecb2de18e66e7b188b5ef042.definition = {
    methods: ["get","head"],
    url: '/api/buyer/rider-chats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url = (options?: RouteQueryOptions) => {
    return buyerThreads426b45b8ecb2de18e66e7b188b5ef042.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
buyerThreads426b45b8ecb2de18e66e7b188b5ef042.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
buyerThreads426b45b8ecb2de18e66e7b188b5ef042.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
    const buyerThreads426b45b8ecb2de18e66e7b188b5ef042Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
        buyerThreads426b45b8ecb2de18e66e7b188b5ef042Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/api/buyer/rider-chats'
 */
        buyerThreads426b45b8ecb2de18e66e7b188b5ef042Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerThreads426b45b8ecb2de18e66e7b188b5ef042.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerThreads426b45b8ecb2de18e66e7b188b5ef042.form = buyerThreads426b45b8ecb2de18e66e7b188b5ef042Form
    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
const buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url(options),
    method: 'get',
})

buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.definition = {
    methods: ["get","head"],
    url: '/buyer/rider-chats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url = (options?: RouteQueryOptions) => {
    return buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
    const buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
        buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerThreads
 * @see app/Http/Controllers/Api/DeliveryChatController.php:91
 * @route '/buyer/rider-chats'
 */
        buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b.form = buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870bForm

/**
* Multiple routes resolve to \App\Http\Controllers\Api\DeliveryChatController::buyerThreads, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buyerThreads['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buyerThreads = {
    '/api/buyer/rider-chats': buyerThreads426b45b8ecb2de18e66e7b188b5ef042,
    '/buyer/rider-chats': buyerThreadsd40bb9c7a9dc5bd1ca24b572e23e870b,
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
export const riderIndex = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riderIndex.url(args, options),
    method: 'get',
})

riderIndex.definition = {
    methods: ["get","head"],
    url: '/api/rider-app/jobs/{id}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
riderIndex.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return riderIndex.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
riderIndex.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: riderIndex.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
riderIndex.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: riderIndex.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
    const riderIndexForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: riderIndex.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
        riderIndexForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riderIndex.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:48
 * @route '/api/rider-app/jobs/{id}/messages'
 */
        riderIndexForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: riderIndex.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    riderIndex.form = riderIndexForm
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:54
 * @route '/api/rider-app/jobs/{id}/messages'
 */
export const riderSend = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderSend.url(args, options),
    method: 'post',
})

riderSend.definition = {
    methods: ["post"],
    url: '/api/rider-app/jobs/{id}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:54
 * @route '/api/rider-app/jobs/{id}/messages'
 */
riderSend.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return riderSend.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:54
 * @route '/api/rider-app/jobs/{id}/messages'
 */
riderSend.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderSend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:54
 * @route '/api/rider-app/jobs/{id}/messages'
 */
    const riderSendForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: riderSend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:54
 * @route '/api/rider-app/jobs/{id}/messages'
 */
        riderSendForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: riderSend.url(args, options),
            method: 'post',
        })
    
    riderSend.form = riderSendForm
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:60
 * @route '/api/rider-app/jobs/{id}/messages/read'
 */
export const riderRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderRead.url(args, options),
    method: 'post',
})

riderRead.definition = {
    methods: ["post"],
    url: '/api/rider-app/jobs/{id}/messages/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:60
 * @route '/api/rider-app/jobs/{id}/messages/read'
 */
riderRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return riderRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:60
 * @route '/api/rider-app/jobs/{id}/messages/read'
 */
riderRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: riderRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:60
 * @route '/api/rider-app/jobs/{id}/messages/read'
 */
    const riderReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: riderRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::riderRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:60
 * @route '/api/rider-app/jobs/{id}/messages/read'
 */
        riderReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: riderRead.url(args, options),
            method: 'post',
        })
    
    riderRead.form = riderReadForm
const DeliveryChatController = { buyerIndex, buyerSend, buyerRead, buyerThreads, riderIndex, riderSend, riderRead }

export default DeliveryChatController
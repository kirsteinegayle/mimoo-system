import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
export const buyerIndex = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex.url(args, options),
    method: 'get',
})

buyerIndex.definition = {
    methods: ["get","head"],
    url: '/api/buyer/orders/{id}/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerIndex.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buyerIndex.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerIndex.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buyerIndex.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
    const buyerIndexForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buyerIndex.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerIndexForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerIndex
 * @see app/Http/Controllers/Api/DeliveryChatController.php:68
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerIndexForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buyerIndex.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buyerIndex.form = buyerIndexForm
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
export const buyerSend = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend.url(args, options),
    method: 'post',
})

buyerSend.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerSend.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerSend.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
buyerSend.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerSend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
    const buyerSendForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerSend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerSend
 * @see app/Http/Controllers/Api/DeliveryChatController.php:74
 * @route '/api/buyer/orders/{id}/chat'
 */
        buyerSendForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerSend.url(args, options),
            method: 'post',
        })
    
    buyerSend.form = buyerSendForm
/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
export const buyerRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRead.url(args, options),
    method: 'post',
})

buyerRead.definition = {
    methods: ["post"],
    url: '/api/buyer/orders/{id}/chat/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
buyerRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return buyerRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
buyerRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buyerRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
    const buyerReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: buyerRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeliveryChatController::buyerRead
 * @see app/Http/Controllers/Api/DeliveryChatController.php:80
 * @route '/api/buyer/orders/{id}/chat/read'
 */
        buyerReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: buyerRead.url(args, options),
            method: 'post',
        })
    
    buyerRead.form = buyerReadForm
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
const DeliveryChatController = { buyerIndex, buyerSend, buyerRead, riderIndex, riderSend, riderRead }

export default DeliveryChatController